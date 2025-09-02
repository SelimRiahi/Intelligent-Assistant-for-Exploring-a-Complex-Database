import pyodbc

def get_connection():
    server = 'your-server-name.database.windows.net'
    database = 'your-database'
    username = 'your-username'
    password = 'your-password'
    driver= '{ODBC Driver 17 for SQL Server}'

    connection_string = f'DRIVER={driver};SERVER={server};DATABASE={database};UID={username};PWD={password}'
    conn = pyodbc.connect(connection_string)
    return conn

def get_table_columns(cursor):
    query = """
    SELECT TABLE_NAME, COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    ORDER BY TABLE_NAME, ORDINAL_POSITION;
    """
    cursor.execute(query)
    results = cursor.fetchall()

    tables = {}
    for row in results:
        table = row[0]
        column = row[1]
        if table not in tables:
            tables[table] = []
        tables[table].append(column)
    return tables

def get_sample_rows(cursor, tables):
    samples = {}
    for table in tables:
        try:
            cursor.execute(f"SELECT TOP 3 * FROM {table}")
            rows = cursor.fetchall()
            samples[table] = [list(row) for row in rows]
        except Exception as e:
            samples[table] = [f"Erreur lors de la lecture: {e}"]
    return samples
