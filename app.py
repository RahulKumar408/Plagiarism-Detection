from flask import Flask, render_template, request, jsonify
import PyPDF2
import zipfile
import io
from utils import *
import pandas as pd
from flask_cors import CORS

# app = Flask(__name__)
app = Flask(__name__, template_folder='./public_html', static_folder='public_html/static')
CORS(app)

# home route
@app.route('/')
def index():
    return render_template('index.html')
# about route
@app.route('/about')
def about():
    return render_template('about.html')


# file process route

def read_pdf_content(pdf_file):
    pdf_reader = PyPDF2.PdfReader(pdf_file)
    pdf_text = ""
    for page_num in range(len(pdf_reader.pages)):
        page = pdf_reader.pages[page_num]
        pdf_text += page.extract_text()
    return pdf_text

@app.route('/process', methods=['POST'])
def process_files():
    # print("req is coming")
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']

    # Check file extension (allow only .pdf or .zip)
    if file and (file.filename.endswith('.pdf') or file.filename.endswith('.zip')):
        if file.filename.endswith('.pdf'):
            # Read content from PDF file
            
            pdf_text = read_pdf_content(file)
            # Process the PDF content (replace with your logic)
            result = Check_AI_Text(pdf_text)
            print("PDF Content:", result)

            return jsonify({'csv_data': result, 'file_type': 'text'})
        
        elif file.filename.endswith('.zip'):
            # Extract contents from ZIP file
            dict_result = {}
            with zipfile.ZipFile(file, 'r') as zip_ref:
                for member_name in zip_ref.namelist():
                    if member_name.lower().endswith('.pdf'):
                        # Extract PDF file and process its content
                        with zip_ref.open(member_name) as pdf_file:
                            pdf_text = read_pdf_content(pdf_file)
                            result = Check_AI_Text(pdf_text)
                            dict_result[member_name] = result
                            
            
            # Convert dictionary to DataFrame
            print(dict_result)
            df = pd.DataFrame(dict_result).T.reset_index()
            df.columns = ['File Name', 'Label', 'Confidence score']

            # Convert DataFrame to CSV-formatted string
            csv_data = df.to_csv(index=False)
            # Return CSV data in the JSON response
            return jsonify({'csv_data': csv_data, 'file_type': 'zip'})
            
    else:
        return jsonify({'error': 'Invalid file format'}), 400

if __name__ == '__main__':
    app.run(debug=True)
