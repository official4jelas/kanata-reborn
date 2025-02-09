export const ownerNumbers = [
    '6281234567890@s.whatsapp.net', // Ganti dengan nomor owner
    // Tambahkan nomor owner lain jika perlu
];

export const isOwner = (number) => {
    return ownerNumbers.includes(number);
};

export const checkOwner = async (sock, id, noTel) => {
    if (!isOwner(noTel)) {
        await sock.sendMessage(id, { text: '❌ Command ini hanya untuk owner bot!' });
        return false;
    }
    return true;
}; 