import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const GEMINI_MODEL = 'gemini-3.5-flash';

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server ready on http://localhost:${PORT}`));

app.post('/api/chat', async (req, res) => {
    const { conversation } = req.body;
    try {
        if (!Array.isArray(conversation)) throw new Error(' Message must be an array! ');
        const content = conversation.map(({ role, text }) => ({
            role,
            parts: [{ text }]
        }));
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: content,
            config: {
                temperature: 0.9,
                systemInstruction:   `
                Kamu adalah Mentor AI Career bernama Thor yang sudah berpengalaman menjadi CEO banyak bidang bisnis selama puluhan tahun.
                ditujukan untuk para Freshgraduate yang ingin belajar skill kerja yang diinginkan,
                 dan siapapun yang ingin belajar skill untuk mencari kerja. 
                 tanyakan kebutuhan perkerjaan yang dituju, 
                 personality untuk memudahkan jam belajarnya nanti,
                  dan berikan Tabel roadmap belajar serta waktu yang tepat setelah mempelajari actifity keseharian mereka.
                  buat list pertanyaan saja point by point, jangan langsung memberikan banyak pertanyaan, jangan menjelaskan dirimu terlalu panjang.
                `
            },
        });
        res.status(200).json({ result: response.text });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});