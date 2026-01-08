# 🚀 Project Report: Pathfinder
**Date:** January 7, 2026  
**Status:** Functional Prototype (Active Development)  
**Tech Stack:** MERN (MongoDB, Express, React, Node.js) + AI (Hugging Face Inference)

## 1. Executive Summary
**Pathfinder** is an AI-driven goal management and life-planning application. Unlike simple to-do lists, it acts as a strategic mentor. Users define long-term "Life Goals" (e.g., "Become a CTO"), and the system uses Large Language Models (LLMs) to:
1.  Break these ambitions down into actionable, tactical **Roadmaps**.
2.  Suggest the next logical steps or skills based on the user's **Profile**.
3.  Analyze complex life dilemmas via a **Decision Session** engine.

## 2. Technical Architecture

### **Frontend (`pathfinder-frontend`)**
*   **Framework:** React (Vite)
*   **Styling:** Tailwind CSS (Modern, dark-mode aesthetic)
*   **State Management:** React Hooks (`useState`, `useEffect`)
*   **Routing:** React Router v6
*   **API Client:** Axios with Interceptors (auto-injects JWT token)

### **Backend (`pathfinder-backend`)**
*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Database:** MongoDB (Mongoose ORM)
*   **Authentication:** JWT (JSON Web Tokens) + Bcrypt for password hashing
*   **AI Integration:** `openai` npm library configured to point to **Hugging Face Inference API**.
    *   **Reasoning:** Allows using open-weights models (Qwen, Gemma) without paying for OpenAI credits.

## 3. Core Features & Workflow

### **A. User Onboarding & Profile**
*   **Function:** Users sign up and complete a profile detailing their `currentRole`, `strengths`, and `preferredDomains` (e.g., "backend", "ai-ml").
*   **Significance:** This data is fed into the AI context window to personalize all future recommendations.

### **B. Life Goals (The "North Star")**
*   **Description:** High-level ambitions with a multi-year horizon.
*   **Categories:** Career, Health, Relationships, Learning, Finance.
*   **Linking:** Can be bidirectionally linked to specific tactical goals (e.g., "Life Goal: Healthy Living" ↔ "Tactical Goal: Run a 5k").

### **C. AI-Generated Roadmaps (Tactical Goals)**
*   **The "Magic" Feature:** When a user creates a goal (e.g., "Learn React in 30 days"), the backend:
    1.  Calculates the duration.
    2.  Sends a prompt to **Qwen/Qwen2.5-72B-Instruct**.
    3.  Receives a structured JSON array of phases and tasks.
    4.  Saves these as interactive `steps` in the database.
*   **Recent Fix:** The system now correctly flattens complex nested JSON into a linear checklist compatible with the database schema.

### **D. Decision Sessions ("PathFinder Angel")**
*   **Function:** Users submit a dilemma (e.g., "Should I take a startup job or a corporate role?").
*   **Context:** The AI receives the user's profile and active life goals as context.
*   **Output:** A structured analysis containing:
    *   **Recommended Option**
    *   **Reasoning**
    *   **Short-term Actions**
    *   **Risks**

### **E. Path Recommendations**
*   **Function:** An automated service that runs on the dashboard. It looks at the user's `preferredDomains` (e.g., Backend) and high-priority Life Goals to suggest concrete next projects (e.g., "Master API Architecture").

## 4. Database Schema (MongoDB)

| Model | Key Fields | Purpose |
| :--- | :--- | :--- |
| **User** | `email`, `password` | Authentication entity. |
| **UserProfile** | `strengths`, `preferredDomains`, `currentRole` | Context for AI personalization. |
| **LifeGoal** | `category`, `horizonYears`, `linkedTacticalGoals` | Long-term ambitions. |
| **Goal** | `title`, `steps` (Array), `linkedLifeGoal` | Actionable projects with AI-generated steps. |
| **DecisionSession** | `question`, `options`, `aiAnalysis` (JSON) | History of AI advice sessions. |

## 5. AI Implementation Details

The project uses a clever "Router" pattern to switch models based on the task type:

*   **Task 1: Structured Data Generation (Roadmaps)**
    *   **Model:** `Qwen/Qwen2.5-72B-Instruct`
    *   **Why:** Excellent adherence to JSON schemas; rarely outputs conversational fluff when instructed to output JSON.
    *   **Safeguards:** Includes a robust `cleanAndParseJSON` utility to strip Markdown code blocks (` ```json ... ``` `) often returned by LLMs.

*   **Task 2: Reasoning & Advice (Decisions)**
    *   **Model:** `google/gemma-2-9b-it` (or similar instruction-tuned models)
    *   **Why:** Strong reasoning capabilities for its size; good at "persona" adoption (acting as a mentor).

## 6. Current Status & Recent Fixes
*   **Resolved:** A critical bug where AI roadmaps weren't saving because the backend mapped them to `milestones` (old schema) instead of `steps` (current schema).
*   **Resolved:** Missing `linkedTacticalGoals` field in the `LifeGoal` schema prevented linking goals.
*   **Functional:** The full flow from Login → Create Goal → Generate Roadmap → View Dashboard is working.

## 7. Next Steps (Recommended)
1.  **Frontend Polish:** Display the "Decision Sessions" history in the UI (Backend route exists, UI seems pending).
2.  **Interactive Steps:** Allow users to check off steps in the roadmap (API endpoint needs to support `PATCH /goals/:id/steps/:stepId`).
3.  **Notifications:** Email reminders for pending roadmap tasks.
