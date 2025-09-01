# 🚀 LLM Destekli Akıllı Sorgu Uygulaması

## 📚 Proje Özeti

Bu proje, hem klasik filtreli hem de LLM (Large Language Model) tabanlı vektör arama yöntemlerini bir araya getirerek, **Pepteam JSON** ve **Firebase (Qdrant)** veritabanlarında doğal dilde ve anahtar kelimeyle akıllı arama yapmanızı sağlar.

---

## 🎯 Temel Özellikler

- 🔎 **Pepteam JSON Arama:**  
  İl ve hizmet filtreleriyle, JSON dosyasında klasik anahtar kelime ve alan bazlı arama.

- 🤖 **Firebase/Qdrant Vektör Arama:**  
  Doğal dildeki sorular embedding ile vektörize edilir, Qdrant üzerinde semantik (anlamsal) arama yapılır.  
  İsim, email ve telefon filtreleriyle tam eşleşme desteği.

- 🖥️ **Kullanıcı Dostu CLI:**  
  Komut satırında kullanıcıya sadece ilgili filtreler sorulur, sonuçlar okunaklı şekilde listelenir.

---

## 🛠️ Kurulum

1. **Gerekli Paketleri Yükle:**
   ```bash
   npm install prompt-sync @xenova/transformers @qdrant/qdrant-js

🧠 Nasıl Çalışır?
Pepteam:
JSON dosyasındaki kayıtlar, il ve hizmet filtrelerine ve serbest metin aramasına göre süzülür.

Firebase/Qdrant:
Kullanıcıdan alınan soru embedding ile vektörize edilir.
Qdrant’a vektör araması yapılır, filtreler (isim, email, telefon) hem Qdrant’ta hem de sonuçlarda tekrar kontrol edilir.

⚡ İpuçları
Qdrant’a veri eklerken ve ararken isim/email/telefon alanlarını küçük harfe çevirin.
Sorgularda tam eşleşme gerektiren alanlarda (isim, email, telefon) birebir yazım kullanın.
Sonuç gelmezse, filtreleri boş bırakıp sadece serbest metin ile arama yapmayı deneyin.


✨ Proje Hakkında
Bu uygulama, modern LLM teknolojisi ile klasik arama yöntemlerini birleştirerek, veri tabanlarınızda hızlı, akıllı ve esnek sorgular yapmanızı sağlar.
Kendi projelerinizde kolayca kullanabilir ve geliştirebilirsiniz.


  
