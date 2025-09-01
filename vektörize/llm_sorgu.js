const norm = (s) => (s ? String(s).trim().toLowerCase() : "");
const normPhone = (p) => (p ? String(p).replace(/\s+/g, "") : "");

function searchPepteam(question, province, service) {
  let data;
  try {
    data = require("../database/pepteam_stores_10000_real_provinces.json");
  } catch (error) {
    console.log("Pepteam json okunamadi");
    return [];
  }

  const q = norm(question);
  return data.filter((item) => {
    if (province && (!item.province || norm(item.province) !== norm(province)))
      return false;
    if (
      service &&
      (!item.services || !norm(item.services).includes(norm(service)))
    )
      return false;
    if (q && !Object.values(item).some((val) => norm(String(val)).includes(q)))
      return false;
    return true;
  });
}

async function searchFirebase(question, name, email, phone) {
  const { pipeline } = require("@xenova/transformers");
  const { QdrantClient } = require("@qdrant/qdrant-js");
  const embedder = await pipeline(
    "feature-extraction",
    "Xenova/all-MiniLM-L6-v2"
  );
  const emb = await embedder(question, { pooling: "mean", normalize: true });
  let vector = emb.data ? Array.from(emb.data) : Array.from(emb[0][0]);
  const client = new QdrantClient({ url: "http://localhost:6333" });
  const filter = { must: [] };

  if (name) filter.must.push({ key: "name", match: { value: norm(name) } });
  if (email) filter.must.push({ key: "email", match: { value: norm(email) } });
  if (phone)
    filter.must.push({ key: "phone", match: { value: normPhone(phone) } });

  const resp = await client.search("firebasee_stores", {
    vector,
    filter: filter.must.length ? filter : undefined,
  });
  return (Array.isArray(resp) ? resp : resp.result || []).filter(
    (h) => h.score > 0.5
  );
}

const prompt = require("prompt-sync")();
(async function run() {
  const source = prompt("Kaynak (pepteam/firebase): ").trim().toLowerCase();
  const question = prompt(
    "Bu veritabanı ile ilgili neyi merak ediyorsunuz : "
  ).trim();

  if (source === "pepteam") {
    const province = prompt("İl (opsiyonel): ").trim();
    const service = prompt("Hizmet (opsiyonel): ").trim();
    const results = searchPepteam(question, province, service);
    if (!results.length) return console.log("Sonuç yok.");
    results.forEach((r, i) => console.log(`\n${i + 1}:`, r));
  } else if (source === "firebase") {
    const name = prompt("İsim (opsiyonel): ").trim();
    const email = prompt("Email (opsiyonel): ").trim();
    const phone = prompt("Telefon (opsiyonel): ").trim();
    const results = await searchFirebase(question, name, email, phone);
    if (!results.length) return console.log("Sonuç yok.");
    results.forEach((h, i) => {
      console.log(`\n${i + 1}:`, h.payload, "skor:", h.score.toFixed(3));
    });
  } else {
    console.log("Geçersiz kaynak.");
  }
})();
