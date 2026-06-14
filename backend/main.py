from fastapi import FastAPI
from pydantic import BaseModel
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

class ProyeccionReq(BaseModel):
    career: str
    courses_sent: list[str]

@app.get("/")
async def read_root():
    return {"Hello": "World"}

@app.get("/courses")
async def courses(career:str):
    return c.getCourses(career)

@app.post("/proyection")
async def proyection(req: ProyeccionReq):
    return c.getProyeccion(req.courses_sent, req.career)