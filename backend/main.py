from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import connection as c
app = FastAPI()

origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/")
async def read_root():
    return {"Hello": "World"}

@app.get("/courses")
async def courses():
    return c.courses
