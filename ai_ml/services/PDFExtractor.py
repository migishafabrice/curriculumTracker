from pypdf import PdfReader
from typing import List, Dict, Tuple
import re

class PDFExtractor:
    @staticmethod
    def extract_text_from_pdf(file_path: str) -> str:
        """Extract all text from a PDF file"""
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text()
        return text
    
    @staticmethod
    def extract_curriculum_units(text: str) -> List[Tuple[str, List[str]]]:
        """
        Extract units and their subunits from curriculum text
        Returns: List of tuples (unit_name, [subunit1, subunit2, ...])
        """
        # This pattern might need adjustment based on your actual PDF structure
        unit_pattern = re.compile(r'Unit\s+\d+:\s*(.+?)\n')
        subunit_pattern = re.compile(r'\d+\.\d+\s+(.+?)\n')
        
        units = []
        current_unit = None
        current_subunits = []
        
        for line in text.split('\n'):
            unit_match = unit_pattern.match(line)
            subunit_match = subunit_pattern.match(line)
            
            if unit_match:
                if current_unit:
                    units.append((current_unit, current_subunits))
                current_unit = unit_match.group(1).strip()
                current_subunits = []
            elif subunit_match and current_unit:
                current_subunits.append(subunit_match.group(1).strip())
        
        if current_unit:
            units.append((current_unit, current_subunits))
        
        return units