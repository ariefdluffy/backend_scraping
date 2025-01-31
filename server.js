const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
const PORT = 5000;

const linkBerita = "";

app.use(cors());

// Scraping data dari simpel.kaltimprov.go.id/jadwal
app.get("/api/jadwal", async (req, res) => {
  try {
    const response = await axios.get("https://simpel.kaltimprov.go.id/jadwal");
    const $ = cheerio.load(response.data);

    let jadwal = [];
    $("tbody > tr").each((index, element) => {
      let namaPelatihan = $(element).find("td > a").text().trim();
      let linkRegis = $(element).find("td:nth-child(2) a").attr("href");
      let jenisPelatihan = $(element).find("td:nth-child(3)").text().trim();
      let kuota = $(element).find("td:nth-child(6)").text().trim();
      let status = $(element).find("td:nth-child(7) span").text().trim();

      jadwal.push({ linkRegis, namaPelatihan, jenisPelatihan, kuota, status });
    });

    res.json(jadwal);
  } catch (error) {
    res.status(500).json({ error: "Error fetching jadwal" });
    console.log(error);
  }
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

app.get("/api/berita/detail", async (req, res) => {
  try {
    const { url } = req.query; // URL berita dari frontend
    if (!url) {
      return res.status(400).json({ message: "URL Berita masih kosong!" });
    }

    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    let title = $(".entry-title").text().trim();
    let content = $(".entry-content").text().trim();
    // let publishedDate = $(".meta-item span.updated").text();
    let image = $(".herald-post-thumbnail img").attr("src");

    res.json({ title, content, image });
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil detail berita", error });
    console.log(error);
  }
});

app.get("/", (req, res) => {
  res.json({ message: "Server ON" });
});

// Menjalankan server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
