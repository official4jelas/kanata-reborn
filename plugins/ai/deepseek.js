import axios from "axios";

export const handler = 'deepseek'
export const description = "AI GPT-4o-mini with Web Access provided by *RyzenAI*";
export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
    if (psn === '') {
        sock.sendMessage(id, {
            text: "prefix *deepseek* Tanyakan sesuatu kepada AI GPT-4o-mini\n contoh : deepseek What is Quantum Physics mean?"

        })
        return
    }
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
        }
        const cfg = {
            headers: {
                Accept: 'application/json',
                "Content-Type": 'application/json'
            }
        }
        const { data } = await axios.post('https://fastrestapis.fasturl.cloud/aillm/deepseek', payload, cfg)
        let text = ''
        text += 'Model :' + data.result.model
        text += '\n Result :' + data.result.choices[0].message.content
        await sock.sendMessage(id, { text });
    } catch (error) {
        console.log(error);
        await sock.sendMessage(id, { text: `Terjadi kesalahan di sisi server ${error}` });
    }
};
