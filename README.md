<div align="center">
  <img src="src/app/icon.svg" width="120" height="120" alt="SwachBandu Logo" />
  <br/>
  <h1>🌍 SwachBandu 🌍</h1>
  <p><strong>Namma Ooru, Namma Kasa</strong></p>
  <p><em>A Next-Generation Civic Social Network for Crowdsourced Waste Management.</em></p>
  <br/>
  
  [![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![Firebase](https://img.shields.io/badge/Firebase-v12-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
  [![Framer Motion](https://img.shields.io/badge/Framer_Motion-Production-0055FF?style=for-the-badge&logo=framer)](https://www.framer.com/motion/)

</div>

---

## 🚀 The Vision

**SwachBandu** transforms civic duty into a viral, engaging, and highly visual social experience. Built with a premium "Marine Intelligence" aesthetic, it empowers citizens to report illegal dumping, track real-time pollution maps, and verify cleanups through an Instagram-style community feed. 

No more clunky government portals. We are bringing **SaaS-grade UI/UX** to civic technology.

## ✨ Key Features

- 🗺️ **Live Pollution Mapping:** Real-time geospatial tracking using `react-leaflet` with dynamic "Dark Intelligence" tiles.
- 📸 **Instagram-Style Feed:** A scrolling, media-first feed of reported waste and verified cleanups.
- 🌓 **True Theme Switching:** A flawless, zero-flicker Light/Dark mode integration powered by `next-themes` and Tailwind v4.
- 🎓 **VTU Integration:** Automated tracking for VTU engineering students to earn AICTE Activity Points via live batching.
- 🪙 **Swachh Coins System:** Every verified cleanup algorithmically rewards the hero with Swachh Coins, redeemable for eco-friendly vouchers.
- 🔒 **Secure Authentication:** Integrated directly with Firebase Google Auth.

## 🛠️ Technology Stack

| Architecture Layer | Technology | Purpose |
|--------------------|------------|---------|
| **Frontend** | Next.js 14 (App Router) | High-performance React framework. |
| **Styling** | Tailwind CSS v4 | Utility-first CSS framework for rapid UI development. |
| **Animations** | Framer Motion | Smooth layout transitions and micro-interactions. |
| **Database** | Firebase Firestore | Real-time NoSQL database for feed and map data. |
| **Maps** | Leaflet & React-Leaflet | Open-source interactive mapping. |

## 📦 Local Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Sumanth069/Swatchbandhu.git
   cd Swatchbandhu
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env.local` file in the root directory and add your Firebase credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📱 The Interface

<div align="center">
  <h3>Built with ❤️ for a Cleaner Bengaluru.</h3>
</div>
