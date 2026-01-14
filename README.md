# ✨ BlushBooth

> _The cutest AI-powered photo booth for your web browser!_ 💕

![BlushBooth Banner](https://img.shields.io/badge/Status-Cute_%26_Functional-pink?style=for-the-badge) ![License](https://img.shields.io/badge/License-MIT-rose?style=for-the-badge)

BlushBooth is a **kawaii aesthetic web application** that brings the magic of a photo booth to your device. Capture moments, apply adorable filters, choose from cute border patterns, and use **Google Gemini AI** to enhance your photos with magical effects!

## 🌸 Features

- **📸 Photo Booth Experience**: Capture single shots or classic 3-strip / 4-strip photo collages.
- **✨ AI Magic**: Enhance your photos with AI presets like "Glow Up", "Anime", "Vintage Noir", and "Cyberpunk" (powered by Google Gemini).
- **🎨 Creative Editor**:
  - **Filters**: Adjust brightness, contrast, blur, and grain.
  - **Border Patterns**: Choose from **Hearts, Stars, Dots, Checker, Striped, and Floral** patterns.
  - **Layouts**: Switch between Strip, Polaroid, and Square frames.
- **🎀 Cute Aesthetic**: A fully responsive, lightweight UI with soft gradients, pastel colors, and smooth animations.
- **💾 Local Gallery**: Automatically saves your memories to your browser's local storage.
- **📱 Mobile Friendly**: Works perfectly on phones and desktops.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS (Custom "Coquette" Theme)
- **AI Integration**: Google Gemini API (`@google/genai`)
- **Icons**: Lucide React
- **Deployment**: Ready for Netlify

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- A Google Gemini API Key ([Get one here](https://aistudio.google.com/app/apikey))

### Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/Sathvik-Nagesh/Blushbooth.git
    cd blushbooth
    ```

2.  **Install dependencies**

    ```bash
    npm install
    ```

3.  **Set up Environment Variables**
    Create a `.env.local` file in the root directory and add your API Key:

    ```env
    GEMINI_API_KEY=your_actual_api_key_here
    ```

4.  **Run Locally**
    ```bash
    npm run dev
    ```
    Open `http://localhost:3000` to see your booth!

## 🌐 Deployment

This project is configured for **Netlify**.

1.  Push your code to GitHub.
2.  Import the project in Netlify.
3.  Add the `GEMINI_API_KEY` in **Site Settings > Environment Variables**.
4.  Deploy! (The `netlify.toml` handles the build settings).

## 🤳 Usage Guide

1.  **Grant Camera Access**: Allow the browser to use your camera.
2.  **Select Mode**: Choose Single, 3-Strip, or 4-Strip.
3.  **Pick a Pattern**: Select a cute border pattern (optional).
4.  **Capture**: Strike a pose! The timer will count down.
5.  **Edit**:
    - Use the **Magic** tab to apply AI effects.
    - Use **Layout** to change frames or patterns.
    - Use **Adjust** for fine-tuning.
6.  **Save**: Click "Keep It! 💕" to download your photo.

## 🤝 Contributing

Feel free to fork this repo and submit pull requests! Ideas for new cute patterns or AI prompts are always welcome. to make it even cuter!

---

Made with 💖 by [Sathvik Nagesh](https://github.com/Sathvik-Nagesh)
