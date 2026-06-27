const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const submitBtn = form.querySelector('button');
const welcomeEl = chatBox.querySelector('.welcome');

const conversation = [];

marked.use({
  breaks: true,
  gfm: true,
});


form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  if (welcomeEl) welcomeEl.remove();

  conversation.push({ role: 'user', text: userMessage });
  appendMessage('user', userMessage);
  input.value = '';
  input.focus();
  submitBtn.disabled = true;

  const thinkingEl = appendThinking();

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation }),
    });

    if (!response.ok) {
      throw new Error('Server error: ' + response.status);
    }

    const data = await response.json();

    if (data.result) {
      conversation.push({ role: 'model', text: data.result });
      renderBotMessage(thinkingEl, data.result);
    } else {
      renderBotMessage(thinkingEl, 'Maaf, tidak ada respons yang diterima.', true);
    }
  } catch (err) {
    console.error('Chat error:', err);
    renderBotMessage(thinkingEl, 'Gagal mendapatkan respons dari server. Silakan coba lagi.', true);
  } finally {
    submitBtn.disabled = false;
  }
});

function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.className = 'message ' + sender;
  msg.textContent = text;
  chatBox.appendChild(msg);
  scrollToBottom();
  return msg;
}

function appendThinking() {
  const msg = document.createElement('div');
  msg.className = 'message bot thinking';

  const indicator = document.createElement('div');
  indicator.className = 'typing-indicator';
  indicator.innerHTML = '<span></span><span></span><span></span>';

  msg.appendChild(indicator);
  chatBox.appendChild(msg);
  scrollToBottom();
  return msg;
}

function renderBotMessage(el, text, isError) {
  let html = marked.parse(text);
  html = html.replace(/<table>/g, '<div class="table-wrapper"><table>');
  html = html.replace(/<\/table>/g, '</table></div>');
  el.className = 'message bot';
  el.innerHTML = html;

  if (isError) {
    el.classList.add('error-message');
  }

  scrollToBottom();
}

function scrollToBottom() {
  requestAnimationFrame(() => {
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}


