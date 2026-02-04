from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import shutil
import os
import uuid

from database import engine, get_db, Base
import models, schemas
from ai_engine import ai_engine
from priority_engine import calculate_priority

# Init DB
Base.metadata.create_all(bind=engine)

app = FastAPI(title="ResQNet API", description="AI Disaster Intelligence Platform")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static mounts for images if needed, or just serve generic
from fastapi.staticfiles import StaticFiles
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
def read_root():
    return {"message": "ResQNet AI System Online"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/upload", response_model=schemas.ReportResponse)
async def upload_image(
    file: UploadFile = File(...),
    source: str = Form(...),
    latitude: float = Form(None),
    longitude: float = Form(None),
    location: str = Form(None),
    db: Session = Depends(get_db)
):
    import logging
    import traceback
    logging.basicConfig(filename='backend_debug.log', level=logging.ERROR)
    
    try:
        # 1. Save File
        file_ext = file.filename.split(".")[-1]
        file_name = f"{uuid.uuid4()}.{file_ext}"
        file_path = f"uploads/{file_name}"
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 2. AI Inference
        ai_result = ai_engine.analyze_image(file_path)
        
        # 3. Priority Calculation
        priority_result = calculate_priority(
            ai_result["damage_detected"], 
            ai_result["damage_types"], 
            ai_result["confidence"]
        )
        
        # 3.5 Generate Suggestions
        suggestions = ai_engine.generate_suggestions(ai_result["damage_types"])

        # 4. Save to DB
        db_report = models.Report(
            image_path=file_path,
            image_source=source,
            location_name=location,
            latitude=latitude,
            longitude=longitude,
            damage_detected=ai_result["damage_detected"],
            damage_types=ai_result["damage_types"],
            severity=priority_result["severity"],
            confidence=ai_result["confidence"],
            priority_score=priority_result["priority_score"],
            suggested_actions=suggestions["actions"],
            suggested_supplies=suggestions["supplies"],
            required_resources=suggestions["resources"],
            is_emergency=False # Standard uploads are not auto-SOS unless flagged
        )
        
        db.add(db_report)
        db.commit()
        db.refresh(db_report)
        
        return db_report

    except Exception as e:
        logging.error(f"Upload failed: {str(e)}")
        logging.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Server Error: {str(e)}")

@app.get("/reports", response_model=List[schemas.ReportResponse])
def get_reports(db: Session = Depends(get_db)):
    return db.query(models.Report).order_by(models.Report.timestamp.desc()).all()
