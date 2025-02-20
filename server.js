const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");
// const { timeout } = require("puppeteer");

const app = express();
const PORT = 5000;

const linkBerita = "";

app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Untuk menerima JSON juga

app.use(cors());

//Scraping data dari simpel.kaltimprov.go.id/jadwal
// app.get("/api/jadwal", async (req, res) => {
//   try {
//     const response = await axios.get("https://simpel.kaltimprov.go.id/jadwal", {
//       timeout: 10000,
//     });
//     const $ = cheerio.load(response.data);

//     let jadwal = [];
//     $("tbody > tr").each((index, element) => {
//       let namaPelatihan = $(element).find("td > a").text().trim();
//       let linkRegis = $(element).find("td:nth-child(2) a").attr("href");
//       let jenisPelatihan = $(element).find("td:nth-child(3)").text().trim();
//       let tanggalPelatihan = $(element).find("td:nth-child(4)").text().trim();
//       let kuota = $(element).find("td:nth-child(6)").text().trim();
//       let status = $(element).find("td:nth-child(7) span").text().trim();

//       jadwal.push({
//         linkRegis,
//         namaPelatihan,
//         jenisPelatihan,
//         kuota,
//         status,
//         tanggalPelatihan,
//       });
//     });

//     res.json(jadwal);
//   } catch (error) {
//     res.status(500).json({ error: "Error fetching jadwal" });
//     console.log(error);
//   }
// });

// Kata kunci untuk filter pelatihan
const KEYWORDS = [
  "Orientasi",
  "Pelatihan",
  "Sosialisasi",
  "Pengadaan",
  "Rapat",
];
const ALLOWED_STATUS = ["Akan Datang", "Berjalan"]; // Status yang diperbolehkan

// Fungsi scraping
async function scrapeData() {
  try {
    const url = "https://simpel.kaltimprov.go.id/jadwal";
    const { data } = await axios.get(url, { timeout: 10000 });
    const $ = cheerio.load(data);

    let upcomingEvents = [];

    $("tr").each((index, row) => {
      const columns = $(row).find("td");

      if (columns.length >= 6) {
        // Ambil elemen <a> dalam kolom Nama Pelatihan
        const linkElement = $(columns[1]).find("a");
        const namaPelatihan =
          linkElement.text().trim() || $(columns[1]).text().trim();
        const linkRegis = linkElement.attr("href")
          ? `${linkElement.attr("href")}`
          : null;

        const status = $(columns[6]).text().trim(); // Ambil status pelatihan

        const event = {
          namaPelatihan,
          linkRegis,
          jenisPelatihan: $(columns[2]).text().trim(),
          tanggalPelatihan: $(columns[3]).text().trim(),
          kelas: $(columns[4]).text().trim(),
          kuota: $(columns[5]).text().trim(),
          status,
        };

        // Filter berdasarkan kata kunci & status
        if (
          KEYWORDS.some((keyword) =>
            event.namaPelatihan.toLowerCase().includes(keyword.toLowerCase())
          ) &&
          ALLOWED_STATUS.includes(status)
        ) {
          upcomingEvents.push(event);
        }
      }
    });

    return upcomingEvents;
  } catch (error) {
    console.error("Error saat scraping data Jadwal:", error);
    return { error: "Error fetching jadwal" };
  }
}

// Endpoint API untuk mendapatkan jadwal
app.get("/api/jadwal/filter", async (req, res) => {
  const jadwal = await scrapeData();
  res.json(jadwal);
});

// Scraping data dari bpsdm.kaltimprov.go.id/web/category/berita/berita-umum/
app.get("/api/berita", async (req, res) => {
  try {
    const response = await axios.get(
      "https://bpsdm.kaltimprov.go.id/web/category/berita/berita-umum/"
    );
    const $ = cheerio.load(response.data);

    let berita = [];
    $("article.herald-lay-b").each((index, element) => {
      const article = $(element);

      let imgUrl = article.find("img").attr("src");
      //   let judul = $(element).find("div.item:nth-of-type(2)").text().trim();

      let judul = article.find(".entry-title a").text().trim();
      let linkBerita = article.find(".entry-title a").attr("href");
      let tanggalBerita = article.find(".entry-meta .updated").text();
      let isiBerita = article.find(".entry-content p").text();

      berita.push({ imgUrl, judul, linkBerita, tanggalBerita, isiBerita });
    });

    res.json(berita);
  } catch (error) {
    res.status(500).json({ error: "Error fetching berita" });
    console.log(error);
  }
});

app.get("/api/berita/detail/query", async (req, res) => {
  try {
    const { url } = req.query; // URL berita dari frontend
    if (!url) {
      return res.status(400).json({ message: "URL Berita masih kosong!" });
    }

    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    let title = $("h1").text();
    let content = $(".entry-content").text().trim();
    // let publishedDate = $(".meta-item span.updated").text();
    let image = $(".herald-post-thumbnail img").attr("src");

    res.json({ title, content, image });
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil detail berita", error });
    console.log(error);
  }
});

app.post("/api/berita/detail", async (req, res) => {
  try {
    const { url } = req.body; // URL dikirim melalui form

    const { data } = await axios.get(url, { timeout: 5000 });
    const $ = cheerio.load(data);

    let title = $("h1").text();
    let content = $(".entry-content").text().trim();
    // let publishedDate = $(".meta-item span.updated").text();
    let image = $(".herald-post-thumbnail img").attr("src");

    res.json({ title, content, image });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal mengambil detail berita pada code form", error });
  }
});

app.use((err, req, res, next) => {
  console.error(err);
  if (!res.headersSent) {
    res
      .status(500)
      .json({ message: "Terjadi kesalahan server", error: err.message });
  }
});

app.get("/", (_req, res) => {
  res.json({ message: "Server ON" });
});

app.post("/api/alumni", async (req, res) => {
  const { tahun, kodeJenis } = req.body;

  if (!tahun) {
    return res.json({
      success: true,
      total: 0,
      data: [],
      message: "Silakan pilih tahun dan klik cari",
    });
  }

  try {
    const url = "https://simpel.kaltimprov.go.id/alumni";

    // **1️⃣ Dapatkan halaman awal untuk mengambil CSRF token**
    const response = await axios.get(
      url,
      { withCredentials: true },
      { timeout: 10000 }
    );

    // **Ambil cookies untuk session**
    const cookies = response.headers["set-cookie"];
    const $ = cheerio.load(response.data);

    // **Cari token CSRF dalam meta tag atau input form**
    const csrfToken =
      $('meta[name="csrf-token"]').attr("content") ||
      $('input[name="_token"]').val();

    if (!csrfToken) {
      throw new Error("CSRF token tidak ditemukan!");
    }

    // **2️⃣ Kirim POST request dengan CSRF token dan cookies**
    const formData = new URLSearchParams();
    formData.append("_token", csrfToken); // Sertakan CSRF token
    formData.append("jenis", kodeJenis);
    formData.append("tahun", tahun);

    const { data } = await axios.post(url, formData.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: cookies.join("; "), // Gunakan cookies dari request awal
        Referer: url, // Beberapa situs mengecek referer
      },
    });

    const $result = cheerio.load(data);
    let alumniList = [];

    $result(".table tbody tr").each((index, element) => {
      const tds = $result(element).find("td");
      alumniList.push({
        nip: $result(tds[1]).text().trim(),
        namaPeserta: $result(tds[2]).text().trim(),
        instansiPeserta: $result(tds[3]).text().trim(),
        namaPelatihan: $result(tds[4]).text().trim(),
        tanggalPelatihan: $result(tds[5]).text().trim(),
      });
    });

    res.json({
      success: true,
      total: alumniList.length,
      tahun: tahun,
      kodeJenis: kodeJenis,
      data: alumniList,
    });
  } catch (error) {
    console.error("Error fetching alumni data:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Gagal mengambil data alumni" });
  }
});

// Menjalankan server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
