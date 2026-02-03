# ResQNet: AI-Powered Disaster Intelligence Platform 🚨🌍

> **Live Demo**: [Deploy frontend to Vercel and paste link here]  
> **Backend API**: [Deploy backend to Render and paste link here]

**ResQNet** is a real-time situational awareness tool designed to revolutionize disaster response. By leveraging AI (YOLOv8) and Geolocation, it instantly analyzes disaster imagery to classify severity, prioritize rescue zones, and coordinate resources.

## 🚀 Key Features

*   **🧠 AI Damage Detection**: Automatically identifies floods, fires, collapsed infrastructure, and blocked roads using computer vision.
*   **📍 Precision Geolocation**: One-click GPS integration ensures every report is mapped to 100% accurate coordinates.
*   **🕸️ Smart Priority Engine**: Dynamically ranks disaster zones based on severity (Critical, High, Medium) to guide first responders to where they are needed most.
*   **🗺️ Live Situational Map**: An interactive map view that clusters incidents and auto-centers on the latest critical events.
*   **📋 Mission Planning**: Detailed breakdown of required resources (e.g., "Boats", "Excavators") and supply suggestions for each incident.

## 🛠️ Tech Stack & Credits

*   **Frontend**: React, Vite, Tailwind CSS (Glassmorphism UI), React Leaflet.
*   **Backend**: FastAPI (Python), SQLite.
*   **AI Model**: YOLOv8 (Ultralytics) for Object Detection.
*   **Mapping**: OpenStreetMap & Nominatim API (Geocoding).
*   **Icons**: Lucide React.

## ⚙️ Installation & Setup (Local)

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn main:app --reload
```
*The backend will run at `http://localhost:8000`*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*The frontend will run at `http://localhost:5173`*

## 📦 Deployment Instructions

### Backend (Render/Railway)
1.  Push the code to GitHub.
2.  Connect the repository to Render/Railway.
3.  Set the Root Directory to `backend`.
4.  Build Command: `pip install -r requirements.txt`.
5.  Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`.

### Frontend (Vercel)
1.  Push the code to GitHub.
2.  Connect the repository to Vercel.
3.  Set the Root Directory to `frontend`.
4.  Add Environment Variable: `VITE_API_URL` = (Your Backend URL from step 1).
5.  Deploy!