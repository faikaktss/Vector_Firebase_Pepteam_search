# 🔎 LLM Destekli Pepteam & Firebase (Qdrant) Akıllı Sorgu Uygulaması

[![Node.js](https://img.shields.io/badge/Node.js-%3E=18.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Qdrant](https://img.shields.io/badge/Qdrant-Vector%20DB-FF4F00?logo=qdrant)](https://qdrant.tech/)
![License](https://img.shields.io/badge/license-MIT-blue)

Bu proje; doğal dil (LLM) tabanlı semantik arama ile klasik filtreli aramayı birleştirerek, iki farklı kaynaktan veri üzerinde pratik sorgular yapmanızı sağlar:
- Pepteam JSON dosyası üzerinde: il (province) + hizmet (services) filtreleri ve serbest metin araması
- Firebase verilerinin Qdrant’ta (vektör veritabanı) tutulduğu senaryoda: isim, email, telefon filtreleri + vektör tabanlı semantik arama

Modern LLM embedding modeli (Xenova/all-MiniLM-L6-v2) kullanılarak soru cümlesi vektöre dönüştürülür ve Qdrant’ta benzerlik araması yapılır. Böylece sadece anahtar kelimeye değil, anlamına göre de sonuçlar elde edebilirsiniz.

---

## 🧭 Neden Bu Proje?
- 🤖 Semantik (anlamsal) arama: Kullanıcının doğal dilde sorduğu soruya göre en alakalı kayıtları bulur.
- 🔎 Klasik filtreli arama: İhtiyaç olduğunda alan bazında kesin filtreleme yapılır (il, hizmet, isim, email, telefon).
- 🧩 Basit CLI deneyimi: Komut satırında kullanıcı dostu, kısa sorularla çalışır.
- 🧰 Genişletilebilir yapı: Veri şeması büyüse bile kolayca uyarlanabilir.

---

## 🏗️ Mimari Özeti

```
Soru (Natural Language) ──> Embedding (MiniLM) ──> Qdrant (Vector Search)
                                   │
                                   └──> Filtreler (name/email/phone)

Pepteam JSON ──> Alan filtreleri (province/services) + Serbest metin tarama
```

- Pepteam: JSON içindeki kayıtlarda alan bazlı ve serbest metin araması yapılır.
- Firebase/Qdrant: Soru vektörleştirilir (384 boyut) ve Qdrant’ta arama yapılır. İsteğe bağlı alan filtreleri tam eşleşme ile uygulanır.

---

## 📂 Dizin Yapısı

```
Llm_Sorgu/
├─ database/
│  └─ pepteam_stores_10000_real_provinces.json
├─ vektörize/
│  └─ llm_sorgu.js           ← CLI uygulaması (pepteam + firebase sorgu)
├─ package.json
└─ README.md
```

Not: Qdrant koleksiyonu (firebasee_stores) Qdrant sunucusunda barındırılır.

---

## ⚙️ Kurulum

1) Bağımlılıklar
```bash
npm install prompt-sync @xenova/transformers @qdrant/qdrant-js
```

2) Qdrant
- Yerelde 6333 portunda çalışan bir Qdrant beklenir.
- Docker ile hızlı başlatma (opsiyonel):
```bash
docker run -p 6333:6333 -p 6334:6334 -v qdrant_storage:/qdrant/storage qdrant/qdrant
```

3) Pepteam JSON
- JSON dosyasını şu yola koyun:
```
database/pepteam_stores_10000_real_provinces.json
```
- İl (province) ve hizmet (services) alanları varsa filtreleme çalışır. Yoksa yalnızca serbest metin kısmı taranır.

4) Qdrant Koleksiyonu (Firebase verisi)
- Koleksiyon adı: `firebasee_stores`
- Vektör boyutu: 384 (all-MiniLM-L6-v2 için)
- Payload alanları (öneri): `name` (lowercase), `email` (lowercase), `phone` (boşluksuz), vb.
- Verileri yüklerken normalizasyon yapmanız önerilir:
  - name/email → trim + lowercase
  - phone → boşluksuz (sadece rakamlar mümkünse)

---

## ▶️ Çalıştırma

```bash
node vektörize/llm_sorgu.js
```

Uygulama sizden şu bilgileri ister:
1) Kaynak: pepteam veya firebase
2) Serbest metin soru
3) Seçtiğiniz kaynağa uygun filtreler

---

## 🔹 Kullanım Örnekleri

### Pepteam (JSON) Sorgusu
```
Kaynak (pepteam/firebase): pepteam
Bu veritabanı ile ilgili neyi merak ediyorsunuz : ankara mağazaları
İl (opsiyonel): ankara
Hizmet (opsiyonel): teknik servis
```
- Sonuç: Ankara ilindeki ve “teknik servis” içeren hizmetlere sahip kayıtlar listelenir.
- Not: province/services alanları JSON’da yoksa serbest metin taraması devreye girer (adres, notlar vb. içinde arar).

### Firebase/Qdrant Sorgusu
```
Kaynak (pepteam/firebase): firebase
Bu veritabanı ile ilgili neyi merak ediyorsunuz : melis aldeniz hakkında bilgi
İsim (opsiyonel): melis aldeniz
Email (opsiyonel): 
Telefon (opsiyonel): 
```
- Sonuç: Soru embedding ile vektörize edilir; Qdrant’ta semantik arama yapılır. İsim/email/telefon filtreleri varsa tam eşleşme uygulanır.
- İpucu: Filtreler tam eşleşir. Qdrant’a yüklerken ve ararken aynı normalizasyonu kullanın (küçük harf, telefonda boşluk yok).

---

## 🧪 Doğru Eşleşme İpuçları

- İsim/email filtreleri: Qdrant’a yüklenirken lowercase yaptıysanız, sorguda da lowercase kullanın.
- Telefon: Kaydettiğiniz formatla aynı şekilde girin (öneri: sadece rakamlar).
- Sonuç yoksa:
  - Filtreleri boş bırakıp yalnızca serbest metinle deneyin.
  - Benzerlik eşiğini (kodda SIMILARITY_THRESHOLD) düşürün (örn. 0.65 → 0.55).
  - Qdrant UI’de kaydın payload alanlarını birebir kopyalayarak test edin.

---

## 🧠 Teknik Ayrıntılar

- Embedding modeli: `Xenova/all-MiniLM-L6-v2` (384-dim)
- Arama:
  - Pepteam: dizi taraması + alan kontrollü filtre
  - Firebase: Qdrant `search` + optional filter + skor eşiği
- Normalizasyon yardımcıları:
  - `norm(s)`: trim + lowercase
  - `normPhone(p)`: boşlukları siler

---

## 🛡️ Güvenlik ve Paylaşım

- Gizli anahtarları (örn. serviceAccountKey.json) repoya göndermeyin.
- .gitignore önerisi:
```
node_modules/
.env
*.log
serviceAccountKey.json
```

---

## 🧭 Yol Haritası (Öneriler)

- `LIKE` benzeri kısmi eşleşme için Qdrant filter sonrası payload post-filter genişletme
- Çoklu alan ağırlıklandırma (score fusion) ile daha iyi sıralama
- Web arayüzü (React/Vue) ile görsel sonuç sunumu
- Top-k parametresi ve eşik değeri için CLI seçeneği

---

## 📝 Lisans

MIT — dilediğiniz gibi kullanın, geliştirin, paylaşın.

---

## 🙌 Teşekkür

Bu projeyi kullanarak klasik ve semantik aramayı birlikte deneyimlediğiniz için teşekkürler.  
Herhangi bir sorunuz veya katkı isteğiniz olursa issue/pull request açabilirsiniz. 🚀
