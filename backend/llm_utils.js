// backend/your_llm_utils.js
import Groq from "groq-sdk";
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function groqApiCall(prompt) {
    const completion = await groq.chat.completions.create({
        messages: [
            {
                role: "user",
                content: prompt,
            },
        ],
    model: "llama-3.3-70b-versatile", // or "llama-3-70b-versatile" if that's the correct model name
    });
    return completion.choices[0].message.content;
}