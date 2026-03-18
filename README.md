# ★ TAMAGO ★

> Pixel sanat tarzında bir sanal evcil hayvan bakım oyunu. Kedini besle, oynat, dinlendir ve mutlu et!

---

## 📱 Proje Amacı

TAMAGO, React Native ve Expo ile geliştirilmiş çocuk dostu bir Tamagotchi oyunudur. Oyuncu; açlık, mutluluk ve enerji barlarını dengeleyerek sanal kedisine bakar. Oyun, klasik Tamagotchi mekaniklerine modern oyunlaştırma dinamikleri ekler.

---

## 🎮 Oyunlaştırma Özellikleri

| Özellik | Açıklama |
|---|---|
| **XP & Seviye Sistemi** | Her besleme, aktivite ve mini-oyun XP kazandırır; 100 XP'de seviye atlanır |
| **Coin Sistemi** | Aktiviteler ve mini-oyunlar 🪙 coin kazandırır |
| **Pixel Sprite Sistemi** | Kedinin durumuna göre 5 farklı sprite: normal, mutlu, aç, uyku, sıkılmış |
| **Dinamik Stat Barları** | Tokluk / Mutluluk / Enerji — renk eşiğe göre yeşil/sarı/kırmızı değişir |
| **Düşünce Baloncuğu** | Kedi durumunu bildirir; tıklanabilir ve ilgili ekrana yönlendirir |
| **Idle Animasyonu** | Kedi ruh haline göre hızlı/yavaş zıplar |
| **Oyun Tiki** | Her 3 saniyede mutluluk -2, tokluk -1 azalır |
| **Dinlenme Mekaniği** | Dinlenmede enerji saniyede +2 dolar; otomatik uyanış |
| **Aktiviteler (5 adet)** | Oyun Oyna, Top At, Raket Sal, Bowling, Kitap Oku |
| **Yemek Dolabı (6 yiyecek)** | Patates, Burger, Pizza, Pancake, Tost, Kruvasan |
| **Mini-Oyunlar (3 adet)** | Balık Yakala 🐟 · Simon Söyledi 🎨 · Hızlı Matematik ➕ |
| **Rozetler / Achievements** | 6 farklı rozet kilidi açılabilir |
| **NEŞELENDİR Butonu** | Mutluluk < 30 olunca OYNA butonu değişir |

### 🏆 Rozetler

| Rozet | Koşul |
|---|---|
| 🍗 İlk Adım | İlk kez besleme yap |
| 🎉 Mutlu Son | Mutluluğu 100'e ulaştır |
| ⚡ Enerjik! | Enerjini tamamen doldur |
| 🐟 Balık Avcısı | Balık Yakala'da 5+ balık yakala |
| 🎨 Simon Ustası | Simon'da 5. seviyeye ulaş |
| 🧮 Matematik Dahisi | Hızlı Matematik'ten 5/5 al |

---

## 🛠️ Kullanılan Teknolojiler

- **React Native** (Expo SDK 54)
- **Expo Font** — VT323 pixel yazı tipi
- `useState`, `useRef`, `useEffect`, `useCallback`
- `Animated` API — idle kedi animasyonu
- Tek dosya mimarisi (`App.js`)

---

## 🚀 Nasıl Çalıştırılır?

### Gereksinimler

- [Node.js](https://nodejs.org/) (v18+)
- [Expo Go](https://expo.dev/go) uygulaması (iOS veya Android)

### Kurulum

```bash
# 1. Repoyu klonla
git clone https://github.com/KULLANICI_ADIN/tamago.git
cd tamago

# 2. Bağımlılıkları yükle
npm install

# 3. Expo font paketlerini yükle (ilk kurulumda)
npx expo install @expo-google-fonts/vt323 expo-font

# 4. Uygulamayı başlat
npx expo start
```

Terminalde çıkan QR kodu telefonunuzdaki **Expo Go** uygulamasıyla tarayın.

---

## 📦 APK İndirme

**[⬇️ TAMAGO-v1.0.apk](https://github.com/cerenazr/rn-tamagotchi-/releases)**

> Android cihazlara doğrudan yüklenebilir. Bilinmeyen kaynaklara izin vermeniz gerekebilir.

---

## 🎥 Tanıtım Videosu

**[▶️ YouTube'da İzle](https://youtube.com/shorts/WvKhYWzQiUA?feature=share)**

---

## 📁 Proje Yapısı

```
tamago/
├── App.js                  # Tüm uygulama kodu
├── app.json                # Expo konfigürasyonu
└── assets/
    ├── cat/
    │   ├── cat_normal.png
    │   ├── cat_happy.png
    │   ├── cat_hungry.png
    │   ├── cat_sleep.png
    │   ├── cat_bored.png
    │   ├── activities/     # 5 aktivite görseli
    │   └── food/           # 6 yiyecek görseli
    └── ...
```

---

## 📝 Kullanıcı Geri Bildirim Raporu

Kullanıcı test raporu için: [feedback-report.pdf](./feedback-report.pdf)

---

## 👩‍💻 Geliştirici

Geliştirici adı ve iletişim bilgileri buraya.

---

*AIgile Mobile — 2025*
