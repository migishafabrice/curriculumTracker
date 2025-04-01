from services.db_service import DatabaseService

class Curriculum:
    def __init__(self):
        self.db = DatabaseService()
    
    def save_units(self, units: list):
        """Save units and subunits to database"""
        for unit_name, subunits in units:
            # Save unit
            unit_id = self.db.execute_query(
                "INSERT INTO units (name) VALUES (%s)",
                (unit_name,)
            )
            
            if unit_id and subunits:
                # Save all subunits for this unit
                for subunit in subunits:
                    self.db.execute_query(
                        "INSERT INTO subunits (unit_id, name) VALUES (%s, %s)",
                        (unit_id, subunit)
                    )
    
    def get_all_units(self):
        """Retrieve all units with their subunits"""
        units = self.db.execute_query("SELECT * FROM units", fetch=True)
        if not units:
            return []
        
        result = []
        for unit in units:
            subunits = self.db.execute_query(
                "SELECT name FROM subunits WHERE unit_id = %s",
                (unit['id'],),
                fetch=True
            )
            result.append({
                'unit': unit['name'],
                'subunits': [sub['name'] for sub in subunits]
            })
        
        return result