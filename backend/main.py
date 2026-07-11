from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import connection as c
app = FastAPI()

origins = ["https://motelpaso.github.io",
           "http://localhost:5173",
           "http://127.0.0.1:5173",
           "http://100.102.126.109:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"]
)

class ProyeccionReq(BaseModel):
    career: str
    courses_sent: list[str]
    minor_id: int | None

@app.get("/")
async def read_root():
    return {"Hello": "World"}

@app.get("/courses")
async def courses(career:str):
    return c.getCourses(career)

@app.get("/minors/{minor_id}/courses")
def get_minor_courses_endpoint(minor_id: int):
    return c.getMinorCourses(minor_id)

@app.post("/proyection")
async def proyection(req: ProyeccionReq):
    return c.getProyeccion(req.courses_sent, req.career, req.minor_id)


