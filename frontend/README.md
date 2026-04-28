# QuizNova Mobile — React Native (Expo)

## 🚀 Setup Instructions

### 1. Free Up Disk Space First
npm install requires ~500MB. Free up space, then:

### 2. Install Dependencies
```bash
cd frontend
npm install
```

### 3. Start the App
```bash
npx expo start
```
Scan the QR code with **Expo Go** on your phone, or press `a` for Android emulator / `i` for iOS simulator.

---

## 📁 Project Structure

```
frontend/
├── App.js                        ← Entry point
├── app.json                      ← Expo config
├── babel.config.js               ← Babel + Reanimated plugin
├── package.json                  ← All dependencies
└── src/
    ├── theme/
    │   └── index.js              ← Colors, Gradients, Spacing, Shadows
    ├── services/
    │   └── api.js                ← Axios instance + all API endpoints
    ├── store/
    │   ├── authStore.js          ← Zustand auth (login/register/logout)
    │   ├── userStore.js          ← Zustand profile (fetch/update/XP)
    │   └── quizStore.js          ← Zustand quiz (fetch/AI/submit)
    ├── hooks/
    │   ├── useAuth.js            ← Auth hook with navigation side effects
    │   └── useQuiz.js            ← Quiz hook with timer logic
    ├── components/
    │   ├── AnimatedButton.js     ← Gradient button with scale + glow + haptics
    │   ├── Card.js               ← Glassmorphism card
    │   ├── ProgressBar.js        ← Animated gradient progress bar
    │   ├── QuizOption.js         ← Answer option with correct/wrong states
    │   ├── LeaderboardItem.js    ← Rank item with medals
    │   ├── AvatarSelector.js     ← 12-avatar emoji grid selector
    │   └── ParticleBackground.js ← Floating neon particle animation
    ├── screens/
    │   ├── SplashScreen.js       ← Logo + particles + auth redirect
    │   ├── LoginScreen.js        ← Email/password + API
    │   ├── SignupScreen.js       ← 2-step: details + avatar picker
    │   ├── HomeScreen.js         ← Dashboard: XP, stats, quick actions
    │   ├── QuizScreen.js         ← Full quiz: timer, confetti, results
    │   ├── AIQuizScreen.js       ← AI generator + live quiz + results
    │   ├── BattleScreen.js       ← Matchmaking → countdown → duel → result
    │   ├── LeaderboardScreen.js  ← Podium + ranked list + filters
    │   ├── AnalyticsScreen.js    ← Bar chart + stats + achievements
    │   ├── ProfileScreen.js      ← Avatar, XP, edit form, bio
    │   └── AdminScreen.js        ← User list with search + stats
    └── navigation/
        ├── AppNavigator.js       ← Root stack navigator
        └── TabNavigator.js       ← Custom glass bottom tab bar
```

---

## 🔗 API Endpoints Used

| Endpoint | Method | Screen |
|---|---|---|
| `/auth/register` | POST | SignupScreen |
| `/auth/login` | POST | LoginScreen |
| `/users/profile` | GET | Home, Profile |
| `/users/profile` | PUT | ProfileScreen |
| `/quiz/:topic` | GET | QuizScreen |
| `/quiz/submit` | POST | QuizScreen |
| `/ai/generate-quiz` | POST | AIQuizScreen |
| `/leaderboard` | GET | LeaderboardScreen |
| `/admin/users` | GET | AdminScreen |

---

## 🎨 Design System

- **Theme**: Dark futuristic, neon purple/cyan/pink
- **Glassmorphism**: Semi-transparent cards with glowing borders
- **Gradients**: Purple→Blue, Cyan→Teal, Pink→Red, Gold
- **Animations**: Reanimated 3 — spring, timing, repeat sequences
- **Haptics**: Medium impact on button press
- **Particles**: 14–24 floating neon orbs per screen

## ⚡ Key Features

- Zustand stores persist auth token via `expo-secure-store`
- Quiz timer auto-advances on timeout
- Confetti cannon fires on correct answers
- Battle mode simulates real-time opponent scoring
- Admin panel with search/filter and role badges
