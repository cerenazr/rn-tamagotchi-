# ★ TAMAGO ★

> A pixel art virtual pet care game. Feed, play with, rest, and keep your cat happy!

---

## 📱 Project Purpose

TAMAGO is a child-friendly Tamagotchi game built with React Native and Expo. The player takes care of a virtual cat by balancing hunger, happiness, and energy bars. The game adds modern gamification dynamics to classic Tamagotchi mechanics.

---

## 🎮 Gamification Features

| Feature | Description |
|---|---|
| **XP & Level System** | Every feeding, activity, and mini-game earns XP; level up at 100 XP |
| **Coin System** | Activities and mini-games earn 🪙 coins |
| **Pixel Sprite System** | 5 different sprites based on cat's mood: normal, happy, hungry, sleep, bored |
| **Dynamic Stat Bars** | Hunger / Happiness / Energy — color changes green/yellow/red based on threshold |
| **Thought Bubble** | Cat reports its status; tappable and navigates to the relevant screen |
| **Idle Animation** | Cat bounces fast/slow based on its mood |
| **Game Tick** | Every 3 seconds happiness -2, hunger -1 |
| **Rest Mechanic** | Energy fills +2 per second while resting; automatic wake-up |
| **Activities (5)** | Play Game, Kick Ball, Swing Racket, Bowling, Read Book |
| **Food Cabinet (6 foods)** | Potato, Burger, Pizza, Pancake, Toast, Croissant |
| **Mini-Games (3)** | Catch Fish 🐟 · Simon Says 🎨 · Quick Math ➕ |
| **Badges / Achievements** | 6 unlockable badges |
| **CHEER UP Button** | PLAY button changes when happiness < 30 |

### 🏆 Achievements

| Badge | Condition |
|---|---|
| 🍗 First Step | Feed for the first time |
| 🎉 Happy Ending | Reach 100 happiness |
| ⚡ Energized! | Fully restore energy |
| 🐟 Fish Hunter | Catch 5+ fish in Catch Fish |
| 🎨 Simon Master | Reach level 5 in Simon Says |
| 🧮 Math Genius | Score 5/5 in Quick Math |

---

## 🛠️ Technologies Used

- **React Native** (Expo SDK 54)
- **Expo Font** — VT323 pixel font
- `useState`, `useRef`, `useEffect`, `useCallback`
- `Animated` API — idle cat animation
- Single-file architecture (`App.js`)

---

## 🚀 How to Run

### Requirements

- [Node.js](https://nodejs.org/) (v18+)
- [Expo Go](https://expo.dev/go) app (iOS or Android)

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/cerenazr/rn-tamagotchi-.git
cd rn-tamagotchi-

# 2. Install dependencies
npm install

# 3. Install Expo font packages (first time only)
npx expo install @expo-google-fonts/vt323 expo-font

# 4. Start the app
npx expo start
```

Scan the QR code in the terminal with the **Expo Go** app on your phone.

---

## 📦 APK Download

**[⬇️ TAMAGO-v1.0.apk](https://github.com/cerenazr/rn-tamagotchi-/releases)**

> Can be installed directly on Android devices. You may need to allow unknown sources.

---

## 🎥 Demo Video

**[▶️ Watch on YouTube](https://youtube.com/shorts/WvKhYWzQiUA?feature=share)**

---

## 📁 Project Structure

```
tamago/
├── App.js                  # All application code
├── app.json                # Expo configuration
└── assets/
    ├── cat/
    │   ├── cat_normal.png
    │   ├── cat_happy.png
    │   ├── cat_hungry.png
    │   ├── cat_sleep.png
    │   ├── cat_bored.png
    │   ├── activities/     # 5 activity images
    │   └── food/           # 6 food images
    └── ...
```

---

## 📝 User Feedback Report

User test report: [feedback-report.pdf](./feedback-report.pdf)

---

## 👩‍💻 Developer

**Ceren Azar**

---

*AIgile Mobile — 2025*
