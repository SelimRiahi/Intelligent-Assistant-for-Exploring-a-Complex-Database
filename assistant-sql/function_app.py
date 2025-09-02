import logging
import azure.functions as func
from openai import AzureOpenAI
import os
import json
import pyodbc
import time
import re

app = func.FunctionApp()

# Cache global pour le schéma (durée : 5 minutes)
schema_cache = {
    "data": None,
    "timestamp": 0,
    "cache_duration": 300  # 5 minutes en secondes
}

# Global variable to store dynamic DB config
current_db_config = None

def connect_to_database(db_config, retries=3):
    """Connexion robuste à la base avec retry automatique"""
    for attempt in range(retries):
        try:
            logging.info(f"🔄 Tentative de connexion {attempt + 1}/{retries}...")
            
            conn = pyodbc.connect(
                f"DRIVER={{ODBC Driver 18 for SQL Server}};"
                f"SERVER={db_config['server']};"
                f"DATABASE={db_config['database']};"
                f"UID={db_config['username']};"
                f"PWD={db_config['password']};"
                f"TrustServerCertificate=yes;"
                f"Connection Timeout=30;"
                f"CommandTimeout=30;",
                timeout=30
            )
            
            # Test rapide de la connexion
            cursor = conn.cursor()
            cursor.execute("SELECT 1")
            cursor.fetchone()
            
            logging.info(f"✅ Connexion réussie (tentative {attempt + 1})")
            return conn
            
        except pyodbc.Error as e:
            error_msg = str(e)
            if attempt < retries - 1:
                wait_time = (attempt + 1) * 2  # 2s, 4s, 6s
                logging.warning(f"⚠️ Tentative {attempt + 1} échouée, retry dans {wait_time}s...")
                time.sleep(wait_time)
            else:
                logging.error(f"❌ Toutes les tentatives ont échoué: {error_msg}")
                raise e
    
    return None

def parse_multiple_sql_queries(sql_text):
    """Parse multiple SQL queries from text, handling various separators"""
    if not sql_text or not sql_text.strip():
        return []
    
    # Clean the input
    sql_text = sql_text.replace("```sql", "").replace("```", "").strip()
    
    # Split by common separators (semicolon, GO, newline with SELECT/INSERT/UPDATE/DELETE)
    # First try semicolon separation
    queries = []
    
    # Split by semicolon but be careful with semicolons inside strings
    parts = re.split(r';\s*(?=(?:[^\']*\'[^\']*\')*[^\']*$)', sql_text)
    
    for part in parts:
        part = part.strip()
        if not part:
            continue
            
        # Remove trailing semicolons
        if part.endswith(';'):
            part = part[:-1].strip()
        
        if part:
            queries.append(part)
    
    # If no semicolon splits found, try splitting by SQL keywords on new lines
    if len(queries) <= 1:
        queries = []
        lines = sql_text.split('\n')
        current_query = []
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Check if line starts with a SQL command
            if re.match(r'^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|WITH)\b', line, re.IGNORECASE):
                # If we have a current query, save it
                if current_query:
                    query_text = '\n'.join(current_query).strip()
                    if query_text.endswith(';'):
                        query_text = query_text[:-1].strip()
                    if query_text:
                        queries.append(query_text)
                
                # Start new query
                current_query = [line]
            else:
                # Continue current query
                current_query.append(line)
        
        # Don't forget the last query
        if current_query:
            query_text = '\n'.join(current_query).strip()
            if query_text.endswith(';'):
                query_text = query_text[:-1].strip()
            if query_text:
                queries.append(query_text)
    
    # Filter out empty queries and return
    final_queries = [q for q in queries if q.strip()]
    
    logging.info(f"📝 Parsed {len(final_queries)} SQL queries")
    for i, q in enumerate(final_queries):
        logging.info(f"Query {i+1}: {q[:100]}...")
    
    return final_queries

def execute_sql_query(sql_query, db_config):
    """Exécute une requête SQL et retourne les résultats"""
    start_time = time.time()
    
    try:
        # Vérifications de sécurité basiques
        sql_upper = sql_query.upper().strip()
        
        # Interdire seulement les opérations système dangereuses
        dangerous_keywords = [
            'EXEC', 'EXECUTE', 'SP_', 'XP_',  # Procédures système
            'SHUTDOWN', 'KILL',               # Commandes système
            'BACKUP', 'RESTORE',              # Opérations de sauvegarde
            'BULK', 'OPENROWSET',             # Accès fichiers
            'GRANT', 'REVOKE', 'DENY',        # Permissions
            'CREATE USER', 'DROP USER',       # Gestion utilisateurs
            'ALTER LOGIN', 'CREATE LOGIN'     # Authentification
        ]
        
        for keyword in dangerous_keywords:
            if keyword in sql_upper:
                return f"Erreur: Opération non autorisée - {keyword} détecté"
        
        # Connexion à la base
        conn = pyodbc.connect(
            f"DRIVER={{ODBC Driver 18 for SQL Server}};"
            f"SERVER={db_config['server']};"
            f"DATABASE={db_config['database']};"
            f"UID={db_config['username']};"
            f"PWD={db_config['password']};"
            f"TrustServerCertificate=yes;"
            f"Connection Timeout=30;",
            timeout=30
        )
        cursor = conn.cursor()
        
        # Exécuter la requête
        cursor.execute(sql_query)
        
        # Déterminer le type d'opération
        operation_type = sql_upper.split()[0] if sql_upper else "UNKNOWN"
        
        # Gérer différents types de requêtes
        if operation_type in ['SELECT']:
            # Pour SELECT : récupérer les résultats
            rows = cursor.fetchall()
            columns = [column[0] for column in cursor.description] if cursor.description else []
            
            results = []
            for row in rows:
                row_dict = {}
                for i, value in enumerate(row):
                    column_name = columns[i] if i < len(columns) else f"column_{i}"
                    if value is None:
                        row_dict[column_name] = None
                    elif isinstance(value, (int, float, str, bool)):
                        row_dict[column_name] = value
                    else:
                        row_dict[column_name] = str(value)
                results.append(row_dict)
            
            execution_time = round((time.time() - start_time) * 1000, 2)
            conn.commit()
            conn.close()
            
            return {
                "operation": "SELECT",
                "data": results,
                "count": len(results),
                "columns": columns,
                "execution_time": execution_time,
                "message": f"Requête exécutée avec succès - {len(results)} lignes retournées"
            }
            
        elif operation_type in ['INSERT', 'UPDATE', 'DELETE']:
            # Pour les modifications : récupérer le nombre de lignes affectées
            affected_rows = cursor.rowcount
            execution_time = round((time.time() - start_time) * 1000, 2)
            conn.commit()
            conn.close()
            
            return {
                "operation": operation_type,
                "data": [],
                "count": 0,
                "affected_rows": affected_rows,
                "execution_time": execution_time,
                "message": f"{operation_type} exécuté avec succès - {affected_rows} lignes affectées"
            }
            
        elif operation_type in ['CREATE', 'ALTER', 'DROP']:
            # Pour les modifications de structure
            execution_time = round((time.time() - start_time) * 1000, 2)
            conn.commit()
            conn.close()
            
            return {
                "operation": operation_type,
                "data": [],
                "count": 0,
                "execution_time": execution_time,
                "message": f"{operation_type} exécuté avec succès"
            }
            
        else:
            # Autres types de requêtes
            try:
                rows = cursor.fetchall()
                columns = [column[0] for column in cursor.description] if cursor.description else []
            except:
                rows = []
                columns = []
            
            execution_time = round((time.time() - start_time) * 1000, 2)
            conn.commit()
            conn.close()
            
            return {
                "operation": operation_type,
                "data": rows,
                "count": len(rows) if rows else 0,
                "columns": columns,
                "execution_time": execution_time,
                "message": f"Requête {operation_type} exécutée avec succès"
            }
        
    except pyodbc.Error as e:
        error_msg = str(e)
        logging.error(f"❌ Erreur SQL lors de l'exécution: {error_msg}")
        return f"Erreur SQL: {error_msg}"
    except Exception as e:
        logging.error(f"❌ Erreur générale lors de l'exécution: {e}")
        return f"Erreur: {str(e)}"

def execute_multiple_sql_queries(sql_queries, db_config):
    """Execute multiple SQL queries and return combined results"""
    if not sql_queries:
        return {
            "status": "error",
            "message": "No valid SQL queries found"
        }
    
    all_results = []
    total_execution_time = 0
    
    for i, query in enumerate(sql_queries):
        logging.info(f"🔄 Executing query {i+1}/{len(sql_queries)}: {query[:50]}...")
        
        try:
            result = execute_sql_query(query, db_config)
            
            # Check if result is an error string
            if isinstance(result, str) and result.startswith("Erreur"):
                all_results.append({
                    "query_number": i + 1,
                    "sql_query": query,
                    "status": "error",
                    "message": result
                })
            else:
                # Success result
                query_result = {
                    "query_number": i + 1,
                    "sql_query": query,
                    "status": "success",
                    "operation": result.get("operation", "UNKNOWN"),
                    "results": result.get("data", []),
                    "row_count": result.get("count", 0),
                    "affected_rows": result.get("affected_rows"),
                    "execution_time_ms": result.get("execution_time", 0),
                    "message": result.get("message", "Exécution terminée")
                }
                
                total_execution_time += result.get("execution_time", 0)
                all_results.append(query_result)
                
        except Exception as e:
            logging.error(f"❌ Error executing query {i+1}: {str(e)}")
            all_results.append({
                "query_number": i + 1,
                "sql_query": query,
                "status": "error",
                "message": f"Execution error: {str(e)}"
            })
    
    # Count successful and failed queries
    successful_queries = sum(1 for r in all_results if r.get("status") == "success")
    failed_queries = len(all_results) - successful_queries
    
    return {
        "status": "success" if failed_queries == 0 else "partial",
        "total_queries": len(sql_queries),
        "successful_queries": successful_queries,
        "failed_queries": failed_queries,
        "total_execution_time_ms": round(total_execution_time, 2),
        "results": all_results
    }

def get_db_schema_from_database(db_config):
    """Récupère le schéma directement depuis la base de données"""
    try:
        # Utiliser la connexion robuste
        conn = connect_to_database(db_config, retries=3)
        cursor = conn.cursor()

        # Récupérer toutes les tables
        cursor.execute("""
            SELECT TABLE_SCHEMA, TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_TYPE = 'BASE TABLE'
        """)
        tables = cursor.fetchall()

        schema_info = "=== SCHEMA DE BASE DE DONNÉES ===\n\n"
        
        for schema, table in tables:
            # Récupérer les colonnes avec leurs types
            cursor.execute(f"""
                SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
                ORDER BY ORDINAL_POSITION
            """, (schema, table))
            
            columns = cursor.fetchall()
            
            schema_info += f"📋 TABLE: {schema}.{table}\n"
            schema_info += "COLONNES:\n"
            
            for col_name, data_type, is_nullable in columns:
                nullable = "NULL" if is_nullable == "YES" else "NOT NULL"
                schema_info += f"  • {col_name} ({data_type}, {nullable})\n"
            
            # Récupérer un exemple de données
            try:
                cursor.execute(f"SELECT TOP 1 * FROM [{schema}].[{table}]")
                sample_row = cursor.fetchone()
                
                if sample_row:
                    schema_info += "EXEMPLE:\n"
                    column_names = [col[0] for col in columns]
                    for i, col_name in enumerate(column_names):
                        value = sample_row[i] if sample_row[i] is not None else "NULL"
                        if isinstance(value, str) and len(value) > 30:
                            value = value[:27] + "..."
                        schema_info += f"  {col_name}: {value}\n"
                else:
                    schema_info += "EXEMPLE: (table vide)\n"
                    
            except Exception as table_error:
                schema_info += f"EXEMPLE: (non accessible - {str(table_error)})\n"
            
            schema_info += "\n" + "-"*60 + "\n\n"
        
        conn.close()
        logging.info("✅ Schéma récupéré avec succès depuis la base")
        return schema_info
        
    except pyodbc.Error as e:
        error_msg = str(e)
        if "40615" in error_msg:
            logging.error("🚫 Erreur Firewall : IP non autorisée")
            return "Erreur: Accès à la base de données refusé (Firewall) - Ajoutez votre IP dans Azure Portal"
        elif "08001" in error_msg or "timeout" in error_msg.lower():
            logging.error("🚫 Erreur Timeout de connexion")
            return "Erreur: Timeout de connexion - Vérifiez votre réseau et le firewall Azure"
        elif "18456" in error_msg:
            logging.error("🚫 Erreur d'authentification")
            return "Erreur: Authentification échouée"
        else:
            logging.error(f"❌ Erreur SQL: {e}")
            return f"Erreur base de données: {str(e)}"
    except ImportError:
        logging.error("❌ Module pyodbc non disponible")
        return "Erreur: Module pyodbc non installé"
    except Exception as e:
        logging.error(f"❌ Erreur générale lors de la récupération du schéma: {e}")
        return f"Erreur: {str(e)}"

def get_db_schema(db_config):
    """Récupère le schéma avec cache (5 minutes)"""
    current_time = time.time()
    
    # Vérifier si le cache est encore valide
    if (schema_cache["data"] is not None and 
        current_time - schema_cache["timestamp"] < schema_cache["cache_duration"]):
        
        cache_age = int(current_time - schema_cache["timestamp"])
        logging.info(f"📋 Utilisation du schéma en cache (âge: {cache_age}s)")
        return schema_cache["data"]
    
    # Le cache est expiré ou vide, récupérer depuis la DB
    logging.info("🔄 Cache expiré, récupération du schéma depuis la base...")
    fresh_schema = get_db_schema_from_database(db_config)
    
    # Mettre à jour le cache seulement si pas d'erreur
    if not fresh_schema.startswith("Erreur"):
        schema_cache["data"] = fresh_schema
        schema_cache["timestamp"] = current_time
        logging.info("💾 Schéma mis en cache avec succès")
    
    return fresh_schema

@app.function_name(name="SetDatabaseConfig")
@app.route(route="set-db-config", auth_level=func.AuthLevel.ANONYMOUS)
def set_database_config(req: func.HttpRequest) -> func.HttpResponse:
    """Endpoint pour configurer la base de données dynamiquement"""
    global current_db_config
    
    if req.method == "GET":
        return func.HttpResponse(
            "Send a POST request with JSON body: {'server':'...', 'database':'...', 'username':'...', 'password':'...'}",
            status_code=200
        )
    
    try:
        req_body = req.get_json()
        
        # Vérifier que tous les champs requis sont présents
        required_fields = ['server', 'database', 'username', 'password']
        for field in required_fields:
            if field not in req_body or not req_body[field].strip():
                return func.HttpResponse(
                    f"Missing or empty required field: {field}",
                    status_code=400
                )
        
        # Configurer la base de données
        current_db_config = {
            'server': req_body['server'].strip(),
            'database': req_body['database'].strip(), 
            'username': req_body['username'].strip(),
            'password': req_body['password'].strip()
        }
        
        # Tester la connexion
        try:
            conn = connect_to_database(current_db_config, retries=1)
            conn.close()
            
            # Vider le cache pour forcer la récupération du nouveau schéma
            schema_cache["data"] = None
            schema_cache["timestamp"] = 0
            
            return func.HttpResponse(
                json.dumps({
                    "status": "success",
                    "message": "Configuration de base de données mise à jour avec succès",
                    "server": current_db_config['server'],
                    "database": current_db_config['database']
                }),
                status_code=200,
                mimetype="application/json"
            )
            
        except Exception as e:
            current_db_config = None
            return func.HttpResponse(
                json.dumps({
                    "status": "error", 
                    "message": f"Impossible de se connecter à la base de données: {str(e)}"
                }),
                status_code=400,
                mimetype="application/json"
            )
            
    except ValueError:
        return func.HttpResponse(
            "Invalid JSON format",
            status_code=400
        )
    except Exception as e:
        logging.error(f"Configuration error: {str(e)}")
        return func.HttpResponse(
            f"Configuration error: {str(e)}",
            status_code=500
        )

@app.function_name(name="SqlAssistant")
@app.route(route="chat", auth_level=func.AuthLevel.ANONYMOUS)
def main(req: func.HttpRequest) -> func.HttpResponse:
    global current_db_config
    logging.info('SQL Assistant processing request')

    # Handle GET requests
    if req.method == "GET":
        return func.HttpResponse(
            "Send a POST request with JSON body: {'message':'your query'}",
            status_code=200
        )

    # Vérifier si la configuration DB est définie
    if current_db_config is None:
        return func.HttpResponse(
            json.dumps({
                "status": "error",
                "message": "Database configuration not set. Please configure database first."
            }),
            status_code=400,
            mimetype="application/json"
        )

    # Handle POST requests
    try:
        req_body = req.get_json()
        user_message = req_body.get('message', '').strip()
        if not user_message:
            return func.HttpResponse(
                json.dumps({
                    "status": "error",
                    "message": "Missing or empty 'message' field"
                }),
                status_code=400,
                mimetype="application/json"
            )
    except ValueError:
        return func.HttpResponse(
            json.dumps({
                "status": "error",
                "message": "Invalid JSON format. Send: {'message':'your query'}"
            }),
            status_code=400,
            mimetype="application/json"
        )
    except Exception as e:
        logging.error(f"Request error: {str(e)}")
        return func.HttpResponse(
            json.dumps({
                "status": "error", 
                "message": "Bad request"
            }),
            status_code=400,
            mimetype="application/json"
        )

    # Récupérer le schéma avec cache
    schema = get_db_schema(current_db_config)
    
    if schema.startswith("Erreur"):
        return func.HttpResponse(
            json.dumps({
                "status": "error",
                "message": schema
            }),
            status_code=500,
            mimetype="application/json"
        )

    # Generate SQL using OpenAI
    try:
        client = AzureOpenAI(
            api_version="2024-12-01-preview",
            azure_endpoint="https://selim-mdosvfln-eastus2.openai.azure.com/",
            api_key=os.getenv("AZURE_OPENAI_API_KEY")
        )

        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": f"""
                    You are a SQL generator. Rules:
                    1. You can generate multiple SQL queries if the user request requires it
                    2. Separate multiple queries with semicolons (;) or put each query on separate lines
                    3. NEVER add explanations or comments
                    4. Use EXACTLY these tables/columns:
                    
                    {schema}
                    
                    5. Generate valid T-SQL for Azure SQL Database
                    6. Use proper table/column names as shown above
                    7. You can generate SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, DROP queries
                    8. NEVER use hardcoded table names - always use the actual table names from the schema above
                    
                    Examples:
                    User: show all tables
                    Response: 
                    SELECT * FROM [schema1].[table1];
                    SELECT * FROM [schema1].[table2];
                    SELECT * FROM [schema2].[table3]
                    
                    User: show users and their orders
                    Response:
                    SELECT * FROM [dbo].[users];
                    SELECT * FROM [dbo].[orders]
                    
                    User: add new user named John from USA
                    Response: INSERT INTO [schema].[actual_table_name] (column1, column2) VALUES ('John', 'USA')
                    """
                },
                {
                    "role": "user",
                    "content": user_message
                }
            ],
            temperature=0.1,
            max_tokens=1000
        )

        # Get the SQL response
        sql_text = response.choices[0].message.content
        logging.info(f"✅ SQL généré: {sql_text}")
        
        # Parse multiple queries
        sql_queries = parse_multiple_sql_queries(sql_text)
        
        if not sql_queries:
            return func.HttpResponse(
                json.dumps({
                    "status": "error",
                    "message": "No valid SQL queries could be parsed from the AI response"
                }),
                status_code=400,
                mimetype="application/json"
            )
        
        # Execute all queries
        try:
            execution_results = execute_multiple_sql_queries(sql_queries, current_db_config)
            
            return func.HttpResponse(
                json.dumps(execution_results, indent=2, default=str),
                status_code=200,
                mimetype="application/json"
            )
            
        except Exception as db_error:
            logging.error(f"❌ Erreur exécution DB: {db_error}")
            return func.HttpResponse(
                json.dumps({
                    "status": "error",
                    "message": f"Erreur lors de l'exécution: {str(db_error)}"
                }),
                status_code=500,
                mimetype="application/json"
            )

    except Exception as e:
        logging.error(f"OpenAI error: {str(e)}")
        return func.HttpResponse(
            json.dumps({
                "status": "error",
                "message": f"AI Service Error: {str(e)}"
            }),
            status_code=500,
            mimetype="application/json"
        )

# Keep existing endpoints...
@app.function_name(name="TestConnection")
@app.route(route="test-db", auth_level=func.AuthLevel.ANONYMOUS)
def test_db(req: func.HttpRequest) -> func.HttpResponse:
    global current_db_config
    
    if current_db_config is None:
        return func.HttpResponse(
            "❌ No database configuration set",
            status_code=400
        )
        
    schema = get_db_schema(current_db_config)
    
    if schema.startswith("Erreur"):
        return func.HttpResponse(
            f"❌ Connexion échouée: {schema}",
            status_code=500
        )
    else:
        cache_info = f"Cache timestamp: {schema_cache['timestamp']}, Current: {time.time()}"
        return func.HttpResponse(
            f"✅ Connexion réussie!\n\n{cache_info}\n\nSchéma disponible:\n{schema}",
            status_code=200,
            mimetype="text/plain"
        )