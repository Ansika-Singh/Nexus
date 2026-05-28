# Nexus

Nexus is an AI-powered networking and outreach tool that helps you discover professionals, research their backgrounds, and automatically draft hyper-personalized outreach messages using **Gemini 2.5 Flash** and **Tavily**.

## Features
- **Semantic Search:** Uses Tavily and Gemini to find highly relevant professionals on LinkedIn, GitHub, and Instagram based on plain English queries.
- **Deep Research:** Automatically pulls in the latest news, open-source contributions, and professional history to build a context-rich profile on your prospects.
- **AI Wingman:** Drafts personalized networking messages tailored to the individual in multiple tones (Professional, Casual, Academic, Wingman).
- **Personal CRM:** Saves your outreach history to a built-in network tracker, complete with status tracking (Sent, Seen, Replied), CSV exporting, and gamified UI elements.

## Project Structure
The project is decoupled into two parts:
- `nexus-frontend/`: A modern, interactive React + Vite frontend UI with custom animations and a premium glassmorphic aesthetic.
- `nexus-backend/`: A lightweight Python Flask backend handling AI orchestration, agentic logic, and web search.

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- Python 3.10+
- [Gemini API Key](https://aistudio.google.com/)
- [Tavily API Key](https://tavily.com/)

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd nexus-backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use: .\venv\Scripts\activate
   ```
3. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure Environment Variables by creating a `.env` file in the `nexus-backend` folder:
   ```env
   GEMINI_API_KEY=your_gemini_key_here
   TAVILY_API_KEY=your_tavily_key_here
   ```
5. Run the development server:
   ```bash
   python app.py
   ```
   *The backend will run on `http://localhost:5000`.*

### 2. Frontend Setup
1. Open a new terminal tab and navigate to the frontend directory:
   ```bash
   cd nexus-frontend
   ```
2. Install the NPM dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend UI will be accessible at `http://localhost:5173`.*

---
*Built as a showcase for AI-driven semantic networking.*
