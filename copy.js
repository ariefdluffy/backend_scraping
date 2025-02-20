const express = require("express");
const app = express();

const jenisList = [
    { id: 0, name: "Semua" },
    { id: 10, name: "Community of Practices / Sharing Session / Knowledge Sharing" },
    { id: 2, name: "Fungsional" },
    { id: 6, name: "Jabatan Fungsional" },
    { id: 13, name: "Lembaga Sertifikasi Pemerintahan" },
    { id: 24, name: "Manajerial" },
    { id: 12, name: "Orientasi" },
    { id: 15, name: "Pameran Jambore Inovasi Kalimantan (JIK) dan Jambore Inovasi Nusantara (JoINus)" },
    { id: 23, name: "Patok Banding (benchmarking)" },
    { id: 5, name: "Pelatihan Dasar CPNS" },
    { id: 4, name: "Pelatihan Kepemimpinan Administrator" },
    { id: 3, name: "Pelatihan Kepemimpinan Pengawas" },
    { id: 25, name: "Pemerintahan Dalam Negeri" },
    { id: 7, name: "Pengembangan Kompetensi Pimpinan Daerah dan Jabatan Pimpinan Tinggi" },
    { id: 21, name: "Pra Uji Kompetensi" },
    { id: 19, name: "Pra Uji Kompetensi Pemerintahan" },
    { id: 8, name: "Pra Uji Kompetensi Pemerintahan Jabatan Administrator Angkatan II" },
    { id: 17, name: "Rapat Kerja Kepegawian" },
    { id: 14, name: "Rapat Koordinasi" },
    { id: 22, name: "Seminar/Konferensi/Sarasehan" },
    { id: 26, name: "Sertifikasi / Uji Kompetensi" },
    { id: 11, name: "Sosialisasi" },
    { id: 27, name: "Sosialisasi Pedoman Teknis Pengelolaan sistem Pembelajaran Terintegrasi Dalam Pengembangan Kompetensi ASN dan Pendampingan AKPK" },
    { id: 9, name: "Sosialisasi Uji Kompetensi" },
    { id: 16, name: "Sosiokultural" },
    { id: 1, name: "Teknis" },
    { id: 20, name: "Uji Kompetensi Pemerintahan" },
    { id: 18, name: "Uji Kompetensi Pemerintahan Jabatan Administrator Angkatan II" }
];

// Endpoint untuk mendapatkan daftar jenis
app.get("/api/jenis", (req, res) => {
    res.json(jenisList);
});

// Middleware untuk parsing JSON
app.use(express.json());

// Endpoint untuk memproses input user
app.post("/api/filter", (req, res) => {
    const { jenis, tahun } = req.body;

    // Validasi jenis
    const jenisValid = jenisList.some(j => j.id === parseInt(jenis));
    if (!jenisValid) {
        return res.status(400).json({ error: "Jenis tidak valid" });
    }

    // Simpan atau proses data sesuai kebutuhan
    res.json({ message: "Filter berhasil", jenis, tahun });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
