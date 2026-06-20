from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db import Base, engine
from routes import memory, scam, voice

Base.metadata.create_all(bind=engine)

app = FastAPI(title="ArthaRakshak Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # tighten to your Lovable preview/deployed URL before demo day
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(memory.router, prefix="/api")
app.include_router(scam.router, prefix="/api")
app.include_router(voice.router, prefix="/api")

@app.get("/")
def root():
    return {"status": "ArthaRakshak backend running"}