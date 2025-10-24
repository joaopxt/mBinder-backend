# ...existing code...
import json
import mysql.connector
from typing import List, Dict, Any

# Ajuste: arquivo JSON contendo um array de objetos (ou objetos por linha)
JSON_FILE = r"c:\\Users\\joaop\\OneDrive\\Documentos\\Estudo\\mBinder\\mtgCards.json"

# Conexão MySQL (timeouts maiores e SSL desabilitado para localhost)
conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="1234",
    database="m_trader",
    autocommit=False,
    connection_timeout=300,
    use_pure=True,
    ssl_disabled=True,  # evita erro [SSL: BAD_LENGTH] em localhost
)
cur = conn.cursor()

# Tabela e colunas desejadas
table = "library"
columns = [
    "name",
    "image_small",
    "image_normal",
    "set_name",
    "mana_cost",
    "cmc",
    "type_line",
    "colors",
    "color_identity",
    "legalities",
]
placeholders = ", ".join(["%s"] * len(columns))
insert_sql = f"INSERT INTO {table} ({', '.join(columns)}) VALUES ({placeholders})"

def load_json_file(path: str) -> List[Dict[str, Any]]:
    with open(path, "r", encoding="utf-8") as f:
        text = f.read().strip()
        if text.startswith("["):
            return json.loads(text)
        objs = []
        for line in text.splitlines():
            line = line.strip()
            if not line:
                continue
            try:
                objs.append(json.loads(line))
            except json.JSONDecodeError:
                pass
        return objs

def to_json(value, default_if_none):
    """Serializa listas/dicionários para JSON; mantém outros tipos."""
    if value is None:
        value = default_if_none
    if isinstance(value, (list, dict)):
        return json.dumps(value, ensure_ascii=False)
    return value

data = load_json_file(JSON_FILE)

rows = []
for obj in data:
    name = obj.get("name")
    image_uris = obj.get("image_uris") or {}
    if not image_uris and "card_faces" in obj and isinstance(obj["card_faces"], list):
        face = obj["card_faces"][0]
        image_uris = face.get("image_uris") or {}

    image_small = image_uris.get("small")
    image_normal = image_uris.get("normal")
    set_name = obj.get("set_name")

    mana_cost = obj.get("mana_cost")
    cmc = obj.get("cmc")
    type_line = obj.get("type_line")
    colors = to_json(obj.get("colors"), [])
    color_identity = to_json(obj.get("color_identity"), [])
    legalities = to_json(obj.get("legalities"), {})

    rows.append((
        name,
        image_small,
        image_normal,
        set_name,
        mana_cost,
        cmc,
        type_line,
        colors,
        color_identity,
        legalities
    ))

def chunk(seq, size):
    for i in range(0, len(seq), size):
        yield seq[i:i+size]

# Inserção em lotes pequenos com retry
if rows:
    try:
        for batch in chunk(rows, 100):  # lote de 100
            ok = False
            try:
                cur.executemany(insert_sql, batch)
                conn.commit()
                ok = True
            except mysql.connector.Error as e:
                print("Falha no lote, tentando reconectar:", e)
                try:
                    conn.reconnect(attempts=3, delay=2)
                    cur = conn.cursor()
                    cur.executemany(insert_sql, batch)
                    conn.commit()
                    ok = True
                except mysql.connector.Error as e2:
                    conn.rollback()
                    print("Falha após retry, inserindo item a item:", e2)
                    for row in batch:
                        try:
                            cur.execute(insert_sql, row)
                            conn.commit()
                        except mysql.connector.Error as e3:
                            conn.rollback()
                            print("Falha ao inserir registro:", row[0], "-", e3)
            if not ok:
                # já houve fallback item a item acima
                pass
    finally:
        cur.close()
        conn.close()

print(f"Inseridas {len(rows)} linhas em {table}")
# ...existing code...