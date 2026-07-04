import os
import datetime
from pathlib import Path

# Directory for storing documents
DOCUMENTS_DIR = Path("data/documents")
DOCUMENTS_DIR.mkdir(parents=True, exist_ok=True)

class DocumentService:
    @staticmethod
    def generate_receipt_document(
        document_number: str,
        generated_date: str,
        generated_time: str,
        patient_name: str,
        catalog_item_name: str,
        total_amount: int,
        advance_paid: int,
        remaining_amount: int
    ) -> str:
        """Generates a text-based receipt and returns the file path."""
        content = f"""=================================
BOOKING RECEIPT
=================================
Receipt Number: {document_number}
Date: {generated_date}
Time: {generated_time}
---------------------------------
Patient Name: {patient_name}
Service: {catalog_item_name}
---------------------------------
Total Amount: Rs. {total_amount}
Advance Paid: Rs. {advance_paid}
Remaining Balance: Rs. {remaining_amount}
=================================
"""
        filename = f"{document_number}.txt"
        file_path = DOCUMENTS_DIR / filename
        
        with open(file_path, "w") as f:
            f.write(content)
            
        return str(file_path)

    @staticmethod
    def generate_final_bill_document(
        document_number: str,
        generated_date: str,
        generated_time: str,
        patient_name: str,
        catalog_item_name: str,
        total_amount: int,
        advance_paid: int,
        balance_paid: int
    ) -> str:
        """Generates a text-based final bill and returns the file path."""
        content = f"""=================================
FINAL BILL
=================================
Bill Number: {document_number}
Date: {generated_date}
Time: {generated_time}
---------------------------------
Patient Name: {patient_name}
Service: {catalog_item_name}
---------------------------------
Total Amount: Rs. {total_amount}
Advance Paid: Rs. {advance_paid}
Balance Collected: Rs. {balance_paid}
=================================
"""
        filename = f"{document_number}.txt"
        file_path = DOCUMENTS_DIR / filename
        
        with open(file_path, "w") as f:
            f.write(content)
            
        return str(file_path)
