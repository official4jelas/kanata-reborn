import { downloadContentFromMessage } from "@seaavey/baileys"

export const getMedia = async (msg) => {
    try {
        // Deteksi tipe media dari pesan
        let mediaType, messageType
        
        if (msg.message?.videoMessage) {
            messageType = 'videoMessage'
            mediaType = 'video'
        } else if (msg.message?.audioMessage) {
            messageType = 'audioMessage' 
            mediaType = 'audio/mp4'
        } else if (msg.message?.imageMessage) {
            messageType = 'imageMessage'
            mediaType = 'image'
        } else {
            throw new Error('Tipe media tidak didukung')
        }

        // Download konten media
        const stream = await downloadContentFromMessage(msg.message[messageType], mediaType)
        let buffer = Buffer.from([])
        
        // Gabungkan chunk data menjadi buffer
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }

        return buffer
    } catch (error) {
        console.error('Error saat mengunduh media:', error)
        throw new Error('Gagal mengunduh media: ' + error.message)
    }
}