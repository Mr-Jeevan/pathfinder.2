# PathFinder - AI-Powered Career & Life Mentor

PathFinder is a full-stack MERN application designed to help users navigate their life and career decisions. By combining structured goal setting (Life Goals & Tactical Goals) with AI-powered analysis, PathFinder acts as a personalized mentor, offering strategic advice based on your unique profile, strengths, and constraints.

## 🚀 Features

-   **User Profiling**: Detailed profile setup including current role, strengths, core values, and time constraints.
-   **Goal Management**:
    -   **Life Goals**: Long-term, high-level aspirations (e.g., "Become a CTO", "Financial Freedom").
    -   **Tactical Goals**: Short-term, actionable steps linked to life goals.
-   **AI Decision Analysis ("Ask Pathfinder")**:
    -   Submit dilemmas or open-ended questions.
    -   Receive structured advice including recommended options, reasoning, immediate actions, and risk assessment.
    -   Context-aware responses that consider your specific profile and active goals.
-   **Path Recommendations**: Automated suggestions for next steps based on your focus area and domain expertise.
-   **Dashboard**: A centralized view of your progress, active goals, and recent insights.

## 🛠️ Tech Stack

### Backend
-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Database**: MongoDB (Mongoose)
-   **Authentication**: JSON Web Tokens (JWT) & bcryptjs
-   **AI Integration**: Hugging Face Inference API (using `Qwen/Qwen2.5-7B-Instruct`)

### Frontend
-   **Framework**: React (Vite)
-   **Styling**: Tailwind CSS
-   **HTTP Client**: Axios

## 📂 Project Structure

```
final-sem/
├── pathfinder-backend/   # Express API Server
│   ├── models/           # Mongoose Schemas (User, Goal, DecisionSession, etc.)
│   ├── routes/           # API Routes
│   ├── services/         # Business logic (Path Recommender)
│   └── server.js         # Entry point
│
└── pathfinder-frontend/  # React Client
    ├── src/
    │   ├── pages/        # Application Views (Dashboard, AskPathfinder, etc.)
    │   ├── components/   # Reusable UI Components
    │   └── api/          # Axios configuration
    └── vite.config.js
```

## ⚡ Getting Started

### Prerequisites
-   Node.js (v16+ recommended)
-   MongoDB (Local instance or Atlas URI)
-   Hugging Face API Token (Free tier is sufficient)

### 1. Backend Setup

1.  Navigate to the backend directory:
    ```bash
    cd pathfinder-backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in `pathfinder-backend/`:
    ```env
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/pathfinder
    JWT_SECRET=your_super_secret_key_change_this
    HF_API_KEY=your_hugging_face_api_token
    HF_MODEL_ID=Qwen/Qwen2.5-7B-Instruct
    ```
4.  Start the server:
    ```bash
    npm nodemon server.js
    ```

### 2. Frontend Setup

1.  Navigate to the frontend directory:
    ```bash
    cd pathfinder-frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm dev
    ```
4.  Open your browser at `http://localhost:5173`.

## 🧠 AI Configuration

This project uses the Hugging Face Inference API.
-   **Token**: Get your free token from [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens).
-   **Model**: The default configured model is `Qwen/Qwen2.5-7B-Instruct`. If you encounter timeouts (500/503 errors), ensure you are using a model supported by the free inference tier (like 7B variants) rather than larger 70B+ models.

## 🛡️ License

This project is created for academic/project purposes.
