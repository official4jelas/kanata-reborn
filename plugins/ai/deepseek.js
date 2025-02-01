import axios from "axios";

export const handler = 'deepseek'
export const description = "Deepseek AI Provided by Hikaru FastUrl";
export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
    if (psn === '') {
        sock.sendMessage(id, {
            text: "prefix *deepseek* Tanyakan sesuatu kepada AI DeepSeek\n contoh : deepseek What is Quantum Physics mean?"

        })
        return
    }
    sock.sendMessage(id, { react: { text: '⏱️', key: m.key } })
    try {
        const payload = {
            "model": "deepseek-ai/DeepSeek-R1",
            "messages": [
                {
                    "role": "system",
                    "content": "Be a helpful assistant"
                },
                {
                    "role": "user",
                    "content": psn
                }
            ],
            "max_tokens": 1000,
            "temperature": 0.2,
            "presence_penalty": 0,
            "frequency_penalty": 0,
            "top_p": 1,
            "top_k": 50
        };

        const cfg = {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        };

        try {
            const response = await fetch("https://fastrestapis.fasturl.cloud/aillm/deepseek", cfg);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            let text = '';
            text += 'Model: ' + data.result.model;
            text += '\nResult: ' + data.result.choices[0].message.content;

            await sock.sendMessage(id, { text });
            await sock.sendMessage(id, { react: { text: '✅', key: m.key } })
        } catch (error) {
            console.error("Error:", error);
        await sock.sendMessage(id, { react: { text: '❌', key: m.key } })
        }

    } catch (error) {
        console.log(error);
        await sock.sendMessage(id, { text: `Terjadi kesalahan di sisi server ${error}` });
    }
};
