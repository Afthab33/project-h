# Project H - AI-Powered Health & Fitness Platform

An intelligent health and fitness platform that provides personalized insights through AI-powered coaching and comprehensive biometric data analysis.

**🚧 This is an MVP (Minimum Viable Product)**

## 🌐 Live Demo
**Visit the live application:** [www.projhealth.com](https://www.projhealth.com)

## ✨ Features

- **🤖 'Oats' AI Coach** - Personalized fitness and nutrition guidance powered by OpenAI
- **💪 Workout Planning** - AI-generated personalized workout routines
- **🥗 Nutrition Planning** - Custom diet plans based on your goals and preferences
- **😴 Sleep Analytics** - Sleep pattern analysis and recommendations
- **🔐 Secure Authentication** - Firebase-powered user management

## 🚀 Local Development

### Prerequisites
- Node.js
- npm or yarn
- Firebase account
- OpenAI API key

### Backend Setup

1. **Clone and navigate to backend:**
   ```bash
   git clone <repository-url>
   cd project-h/backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment variables:**
   Create a `.env` file in the backend directory:
   ```env
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_PRIVATE_KEY=your_private_key
   FIREBASE_CLIENT_EMAIL=your_client_email
   OPENAI_API_KEY=your_openai_key
   ALLOWED_ORIGINS=http://localhost:5173
   NODE_ENV=development
   PORT=3000
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

### Frontend Setup

1. **Navigate to frontend:**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment variables:**
   Create a `.env` file in the frontend directory:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_API_URL=http://localhost:3000
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:5173`

## 🛠️ Tech Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth
- **AI:** OpenAI GPT API
- **Deployment:** Cloud hosting platform

## 📁 Project Structure

```
project-h/
├── frontend/          # React frontend application
├── backend/           # Node.js backend API
└── README.md         # Project documentation
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

---

**Experience personalized health insights today at [www.projhealth.com](https://www.projhealth.com)** 🚀
