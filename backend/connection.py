import psycopg2
import os
from dotenv import load_dotenv
load_dotenv()
DB_CONFIG = {
    'host': os.getenv('DB_HOST'),
    'dbname': os.getenv('DB_NAME'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'port': os.getenv('DB_PORT')
}
def getCourses():
  conn = psycopg2.connect(**DB_CONFIG)
  cur = conn.cursor()

  cur.execute("SELECT code, title, semester FROM courses WHERE career = 'ICCI' LIMIT 5;")
  rows = cur.fetchall()

  cur.close()
  conn.close()
  return rows

getCourses()