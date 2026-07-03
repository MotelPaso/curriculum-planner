import os
from dotenv import load_dotenv
import psycopg2

load_dotenv()
DB_CONFIG = {
    'host': os.getenv('DB_HOST'),
    'dbname': os.getenv('DB_NAME'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'port': os.getenv('DB_PORT'),
    'sslmode': 'require'
}


conn = psycopg2.connect(**DB_CONFIG)
cur = conn.cursor()

try:
  print("connected!")
  print(conn)
except Exception as e:
    conn.rollback()
    print(f"Error: {e}")
    raise
finally:
    cur.close()
    conn.close()
