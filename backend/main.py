from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import countries, relationships, alignment

app = FastAPI(title="Geopolitical Network API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(countries.router)
app.include_router(relationships.router)
app.include_router(alignment.router)


@app.get("/")
def root():
    return {"status": "ok", "docs": "/docs"}
