import mysql.connector
from mysql.connector import Error
from config import Config

class DatabaseService:
    def __init__(self):
        self.config = {
            'host': Config.MYSQL_HOST,
            'database': Config.MYSQL_DB,
            'user': Config.MYSQL_USER,
            'password': Config.MYSQL_PASSWORD
        }
        self.connection = None
    
    def connect(self):
        try:
            self.connection = mysql.connector.connect(**self.config)
            if self.connection.is_connected():
                return self.connection
        except Error as e:
            print(f"Error connecting to MySQL: {e}")
            return None
    
    def disconnect(self):
        if self.connection and self.connection.is_connected():
            self.connection.close()
    
    def execute_query(self, query, params=None, fetch=False):
        cursor = None
        try:
            connection = self.connect()
            if not connection:
                return None
                
            cursor = connection.cursor(dictionary=True)
            cursor.execute(query, params)
            
            if fetch:
                result = cursor.fetchall()
            else:
                connection.commit()
                result = cursor.lastrowid
            
            return result
        except Error as e:
            print(f"Error executing query: {e}")
            return None
        finally:
            if cursor:
                cursor.close()
            self.disconnect()