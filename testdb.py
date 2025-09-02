try:
    import pyodbc
except ImportError:
    print("Erreur: pyodbc n'est pas installé.")
    print("Installez-le avec: pip install pyodbc")
    exit()

# ⚠️ Remplace ces infos par celles de TA base
server = 'sql-assistant-1111.database.windows.net'
database = 'db'
username = 'sql-assistant-1111'
password = 'Hamaselim123.'

try:
    conn = pyodbc.connect(
        f"DRIVER={{ODBC Driver 18 for SQL Server}};"
        f"SERVER={server};"
        f"DATABASE={database};"
        f"UID={username};"
        f"PWD={password};"
        f"TrustServerCertificate=yes"
    )
    cursor = conn.cursor()

    cursor.execute("""
        SELECT TABLE_SCHEMA, TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_TYPE = 'BASE TABLE'
    """)
    tables = cursor.fetchall()

    # Version avec formatage plus propre
    with open("table_columns.txt", "w", encoding="utf-8") as f:
        f.write("=== SCHEMA DE BASE DE DONNÉES ===\n\n")
    
        for schema, table in tables:
            cursor.execute(f"""
                SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
                ORDER BY ORDINAL_POSITION
            """, (schema, table))
            
            columns = cursor.fetchall()
            
            f.write(f"📋 TABLE: {schema}.{table}\n")
            f.write("COLONNES:\n")
            
            for col_name, data_type, is_nullable in columns:
                nullable = "NULL" if is_nullable == "YES" else "NOT NULL"
                f.write(f"  • {col_name} ({data_type}, {nullable})\n")
            
            # Exemple de données
            try:
                cursor.execute(f"SELECT TOP 1 * FROM [{schema}].[{table}]")
                sample_row = cursor.fetchone()
                
                if sample_row:
                    f.write("EXEMPLE:\n")
                    column_names = [col[0] for col in columns]
                    for i, col_name in enumerate(column_names):
                        value = sample_row[i] if sample_row[i] is not None else "NULL"
                        if isinstance(value, str) and len(value) > 30:
                            value = value[:27] + "..."
                        f.write(f"  {col_name}: {value}\n")
                else:
                    f.write("EXEMPLE: (table vide)\n")
            except Exception:
                f.write("EXEMPLE: (non accessible)\n")
            
            f.write("\n" + "-"*60 + "\n\n")
except Exception as e:
    print("Erreur lors de la connexion ou de l'exécution :", e)