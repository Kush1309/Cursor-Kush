import pythoncom
import win32com.client
from pathlib import Path

pythoncom.CoInitialize()
docx = Path(r"c:\Users\Kushagra Saxena\Desktop\Cursur\PROJECT_REPORT.docx")
pdf = Path(r"c:\Users\Kushagra Saxena\Desktop\Cursur\PROJECT_REPORT.pdf")
word = win32com.client.DispatchEx("Word.Application")
word.Visible = False
word.DisplayAlerts = 0

doc = word.Documents.Open(str(docx), ReadOnly=1)
doc.SaveAs2(str(pdf), FileFormat=17)
doc.Close(False)
word.Quit()
print(f"Created: {pdf}")
