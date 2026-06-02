from fastapi import FastAPI
import connection as c
app = FastAPI()

@app.get("/")
async def read_root():
    return {"Hello": "World"}

@app.get("/courses")
async def courses():
    return c.getCourses()