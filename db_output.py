import pandas as pd
import sqlite3

# 📁 CSV ફાઇલ વાંચો
df = pd.read_csv('menu_output.csv')

# 🔄 Column type convert કરો (જેથી SQLite એ યોગ્ય રીતે સમજે)
df['price'] = df['price'].astype(float)
df['veg'] = df['veg'].astype(int)
df['spicy_level'] = df['spicy_level'].astype(int)

# 🗃️ SQLite database સાથે કનેક્ટ થાઓ (નવું બનશે જો ન હોય તો)
conn = sqlite3.connect('db.sql')
cursor = conn.cursor()

# 🏗️ menu ટેબલનું SQLite-compatible schema બનાવો
cursor.executescript("""
CREATE TABLE IF NOT EXISTS menu (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  category TEXT,
  veg INTEGER DEFAULT 1,
  spicy_level INTEGER DEFAULT 0
);
""")

# ✅ દરેક row ને menu ટેબલમાં insert કરો
for _, row in df.iterrows():
    cursor.execute("""
        INSERT INTO menu (name, description, price, category, veg, spicy_level)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        row['name'],
        row['description'],
        row['price'],
        row['category'],
        row['veg'],
        row['spicy_level']
    ))

# 💾 Save and close
conn.commit()
conn.close()

print("✅ CSV ડેટા SQLite DB માં સફળતાપૂર્વક દાખલ થયો!")
