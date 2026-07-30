# AskDocs AI 📄🤖

> **Upload Documents. Ask Questions. Get AI-Powered Answers.**

A full-stack AI-powered web application where users can upload PDF, DOCX, or TXT documents and ask questions. The AI (powered by Google Gemini) answers **only** from the uploaded document content — never from outside knowledge.

Built as a **BCA portfolio project** demonstrating React.js, Django, JWT Authentication, MySQL, and Google Gemini AI with RAG.

---

## 🌐 Live Demo

- **Frontend (Vercel):** Coming soon
- **Backend (Render):** Coming soon

---

## 📋 Features

- 🔐 **JWT Authentication** — Register, login, logout securely
- 📤 **Document Upload** — PDF, DOCX, TXT (max 20 MB)
- 🤖 **AI Q&A (RAG)** — Answers only from your document
- 💬 **Chat Interface** — Modern bubble UI with Markdown formatting
- 📜 **Chat History** — Save and review all past conversations
- 📱 **Responsive** — Works on desktop and mobile

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, React Router, Axios, CSS3 |
| Backend | Python, Django, Django REST Framework |
| Auth | JWT (djangorestframework-simplejwt) |
| Database | MySQL |
| AI | Google Gemini API |
| RAG | LangChain + FAISS Vector Store |
| Documents | PyPDF2, python-docx |

---

## 📁 Project Structure

```
Ask Docs Ai/
├── backend/              ← Django API
│   ├── askdocs/         ← Settings, URLs, WSGI
│   ├── authentication/  ← Register, Login, Logout
│   ├── documents/       ← Upload, List, Delete APIs
│   ├── chat/            ← Ask Question, History APIs
│   ├── utils/           ← RAG helper (core AI logic)
│   ├── media/           ← Uploaded files (auto-created)
│   ├── vector_stores/   ← FAISS indexes (auto-created)
│   ├── manage.py
│   ├── requirements.txt
│   └── .env
│
└── frontend/             ← React App
    └── src/
        ├── components/  ← Navbar, Footer, Cards, etc.
        ├── pages/       ← All page components
        ├── services/    ← Axios API wrappers
        ├── context/     ← AuthContext (global state)
        └── App.jsx      ← Router setup
```

---

## 🚀 Local Setup

### Prerequisites

- Python 3.10+
- Node.js 18+
- MySQL Server
- Google Gemini API Key (from [aistudio.google.com](https://aistudio.google.com))

---

### Step 1 — Create MySQL Database

Open MySQL command line or MySQL Workbench and run:

```sql
CREATE DATABASE askdocs_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

### Step 2 — Backend Setup

```bash
# Navigate to backend folder
cd "d:/Ask Docs Ai/backend"

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
python manage.py makemigrations
python manage.py migrate

# Create an admin user (optional)
python manage.py createsuperuser

# Start the Django server
python manage.py runserver
```

Backend will run at: **http://localhost:8000**

---

### Step 3 — Frontend Setup

```bash
# Navigate to frontend folder
cd "d:/Ask Docs Ai/frontend"

# Install dependencies
npm install

# Start the React development server
npm run dev
```

Frontend will run at: **http://localhost:5173**

---

## 🔑 Environment Variables

### Backend `.env` (already created at `backend/.env`)

```env
SECRET_KEY=your-secret-key
DEBUG=True
DB_NAME=askdocs_db
DB_USER=root
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=3306
GEMINI_API_KEY=your-gemini-api-key
FRONTEND_URL=http://localhost:5173
```

> ⚠️ **Never commit `.env` to GitHub!**

---

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register/   → Register new user
POST   /api/auth/login/      → Login (returns JWT tokens)
POST   /api/auth/logout/     → Logout (blacklists token)
GET    /api/auth/user/       → Get current user info
```

### Documents
```
GET    /api/documents/              → List user's documents
POST   /api/documents/upload/       → Upload a document
DELETE /api/documents/<id>/         → Delete a document
GET    /api/documents/<id>/status/  → Check processing status
```

### Chat
```
POST   /api/chat/ask/                → Ask a question
GET    /api/chat/history/            → Get all chat history
GET    /api/chat/history/<doc_id>/   → History for one document
DELETE /api/chat/history/delete/<id>/ → Delete a chat entry
```

---

## 🧠 How RAG Works (Interview Explanation)

1. **User uploads a document** (PDF, DOCX, TXT)
2. **Backend extracts text** from the document
3. **Text is split into chunks** (~1000 chars with 200 overlap)
4. **Each chunk is converted to embeddings** (vectors) using Gemini
5. **Embeddings are stored in a FAISS index** (saved as `.pkl` file)
6. **User asks a question** → question is also embedded
7. **FAISS finds top-5 most similar chunks** to the question
8. **Chunks + question sent to Gemini** with strict "answer only from context" prompt
9. **Gemini returns formatted answer** → saved to database → shown to user

---

## 🌍 Deployment

### Frontend → Vercel

1. Push `frontend/` to GitHub
2. Go to [vercel.com](https://vercel.com) → Import project
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`

### Backend → Render

1. Push `backend/` to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Set start command: `gunicorn askdocs.wsgi:application`
4. Add all environment variables from `.env`
5. Add `gunicorn` to `requirements.txt`

### Database → MySQL Cloud

Use **PlanetScale** or **Railway** for a managed MySQL database.
Update `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` in Render environment variables.

---

## 📄 License

This project is built for educational and portfolio purposes.

---

*Built with ❤️ using React + Django + Google Gemini AI*
