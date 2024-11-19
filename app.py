from flask import Flask, request, jsonify  # Import Flask and its components
from flask_cors import CORS  # To handle Cross-Origin Resource Sharing
import torch  # PyTorch for deep learning
import spacy  # NLP library for tokenization and NER
from transformers import BertModel, BertTokenizer  # HuggingFace transformers for BERT
import pickle  # To load saved models
import numpy as np  # For numerical operations
import warnings  # To suppress warnings
from collections import Counter  # For counting occurrences

warnings.filterwarnings("ignore")  # Suppress warnings

# Initialize Flask app and enable CORS
app = Flask(__name__)
CORS(app)

# Load spaCy NLP model for text processing
nlp = spacy.load("en_core_web_sm")

# Load pre-trained BERT model and tokenizer
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
bert_model = BertModel.from_pretrained('bert-base-uncased')

# Load pre-trained models and label encoders from .pkl files
accessComplexity_label_encoder = pickle.load(open('accessComplexity_label_encoder.pkl', 'rb'))
accessComplexity_svm_model = pickle.load(open('accessComplexity_svm_model.pkl', 'rb'))
accessVector_label_encoder = pickle.load(open('accessVector_label_encoder.pkl', 'rb'))
accessVector_svm_model = pickle.load(open('accessVector_support vector machine_model.pkl', 'rb'))
availabilityImpact_label_encoder = pickle.load(open('availabilityImpact_label_encoder.pkl', 'rb'))
availabilityImpact_xgboost_model = pickle.load(open('availabilityImpact_xgboost_model.pkl', 'rb'))
confidentialityImpact_label_encoder = pickle.load(open('confidentialityImpact_label_encoder.pkl', 'rb'))
confidentialityImpact_xgboost_model = pickle.load(open('confidentialityImpact_xgboost_model.pkl', 'rb'))
integrityImpact_label_encoder = pickle.load(open('integrityImpact_label_encoder.pkl', 'rb'))
integrityImpact_xgboost_model = pickle.load(open('integratyImpact_xgboost_model.pkl', 'rb'))
baseScore_svr_model = pickle.load(open('baseScore_svr_model.pkl', 'rb'))
impactScore_svm_model = pickle.load(open('impactScore_svm_model.pkl', 'rb'))
exploitabilityScore_ridge_regression_model = pickle.load(open('exploitabilityScore_ridge_regression_model.pkl', 'rb'))
obtainAllPrivilege_label_encoder = pickle.load(open('obtainAllPrivilege_label_encoder.pkl', 'rb'))
obtainAllPrivilege_svm_model = pickle.load(open('obtainAllPrivilege_svm_model.pkl', 'rb'))
obtainUserPrivilege_label_encoder = pickle.load(open('obtainUserPrivilege_label_encoder.pkl', 'rb'))
obtainUserPrivilege_xgboost_model = pickle.load(open('obtainUserPrivilege_xgboost_model.pkl', 'rb'))

# Function to generate BERT embeddings for input text
def get_bert_embedding(text):
    inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=512)
    with torch.no_grad():  # Disable gradient computation
        outputs = bert_model(**inputs)
    embeddings = outputs.last_hidden_state[:, 0, :]  # Extract [CLS] token embeddings
    return embeddings.squeeze().numpy()

# Helper function to ensure valid numerical values
def get_valid_value(val):
    return float(val)

# Main function to make predictions using all pre-trained models
def make_prediction(text):
    vector = get_bert_embedding(text)
    embedding = vector.reshape(1, -1)  # Reshape for model input

    predictions = []

    # Predict using each model and append the results
    EXPLOITABILITY_SCORE = exploitabilityScore_ridge_regression_model.predict(embedding)[0]
    predictions.append(['Exploitability score', get_valid_value(EXPLOITABILITY_SCORE)])

    IMPACT_SCORE = impactScore_svm_model.predict(embedding)[0]
    predictions.append(['Impact score', get_valid_value(IMPACT_SCORE)])

    ACCESS_VECTOR = accessVector_svm_model.predict(embedding)
    ACCESS_VECTOR_CLASS = accessVector_label_encoder.inverse_transform(ACCESS_VECTOR)
    predictions.append(['Access vector', ACCESS_VECTOR_CLASS[0]])

    ACCESS_COMPLEXITY = accessComplexity_svm_model.predict(embedding)
    ACCESS_COMPLEXITY_CLASS = accessComplexity_label_encoder.inverse_transform(ACCESS_COMPLEXITY)
    predictions.append(['Access complexity', ACCESS_COMPLEXITY_CLASS[0]])

    CONFIDENTIALITY_IMPACT = confidentialityImpact_xgboost_model.predict(embedding)
    CONFIDENTIALITY_IMPACT_CLASS = confidentialityImpact_label_encoder.inverse_transform(CONFIDENTIALITY_IMPACT)
    predictions.append(['Confidentiality impact', CONFIDENTIALITY_IMPACT_CLASS[0]])

    INTEGRITY_IMPACT = integrityImpact_xgboost_model.predict(embedding)
    INTEGRITY_IMPACT_CLASS = integrityImpact_label_encoder.inverse_transform(INTEGRITY_IMPACT)
    predictions.append(['Integrity impact', INTEGRITY_IMPACT_CLASS[0]])

    AVAILABILITY_IMPACT = availabilityImpact_xgboost_model.predict(embedding)
    AVAILABILITY_IMPACT_CLASS = availabilityImpact_label_encoder.inverse_transform(AVAILABILITY_IMPACT)
    predictions.append(['Availability impact', AVAILABILITY_IMPACT_CLASS[0]])

    BASE_SCORE = baseScore_svr_model.predict(embedding)[0]
    predictions.append(['Base score', get_valid_value(BASE_SCORE)])

    AUTHENTICATION = ["None"]
    predictions.append(['Authentication', AUTHENTICATION[0]])

    OBTAIN_ALL_PRIVILEGE = obtainAllPrivilege_svm_model.predict(embedding)
    OBTAIN_ALL_PRIVILEGE_CLASS = obtainAllPrivilege_label_encoder.inverse_transform(OBTAIN_ALL_PRIVILEGE)
    predictions.append(['Obtain all privilege', str(OBTAIN_ALL_PRIVILEGE_CLASS[0])])

    OBTAIN_USER_PRIVILEGE = obtainUserPrivilege_xgboost_model.predict(embedding)
    OBTAIN_USER_PRIVILEGE_CLASS = obtainUserPrivilege_label_encoder.inverse_transform(OBTAIN_USER_PRIVILEGE)
    predictions.append(['Obtain user privilege', str(OBTAIN_USER_PRIVILEGE_CLASS[0])])

    # Perform NLP entity extraction and dependency parsing
    doc = nlp(text)
    entities = [f"{ent.text} ({ent.label_})" for ent in doc.ents]
    dependencies = [f"{token.text} -> {token.dep_} -> {token.head.text}" for token in doc]

    predictions.append(['Entities', ', '.join(entities)])
    predictions.append(['Dependencies', ', '.join(dependencies)])

    return predictions

# Fetch data from the NVD API within a date range
def fetch_data(start_date, end_date):
    base_url = 'https://services.nvd.nist.gov/rest/json/cves/2.0/'
    url = f"{base_url}?lastModStartDate={start_date}T00:00:01&lastModEndDate={end_date}T23:59:59"
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
    else:
        return None

# Extract keywords from CPE strings
def extract_keyword(cpe):
    parts = cpe.split(':')
    keyword = "none"
    if len(parts) > 4:
        vendor, product = parts[3], parts[4]
        keyword = f"{vendor} {product}"
    return keyword

# Analyze CVSS metrics from fetched data
def analyze_cvss_metrics(vulnerabilities):
    analysis = {
        # Initialize data structures for storing analysis results
    }

    for vuln in vulnerabilities:
        if 'cvssMetricV2' in vuln['cve']['metrics']:
            metrics = vuln['cve']['metrics']['cvssMetricV2'][0]
            cvss_data = metrics["cvssData"]

            # Count occurrences for categorical data
            def count_category(field, value):
                if value in analysis[field]:
                    analysis[field][value] += 1
                else:
                    analysis[field][value] = 1

            # Perform analysis on each field
    return analysis

# Analyze keyword frequency in vulnerabilities
def analyze_keywords(vulnerabilities):
    keywords = []
    for vuln in vulnerabilities:
        for config in vuln['cve']['configurations']:
            for node in config['nodes']:
                for match in node['cpeMatch']:
                    keywords.append(extract_keyword(match['criteria']))
    top_keywords = Counter(keywords).most_common(20)
    return dict(top_keywords)

# Define API endpoint for predictions
@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    text = data['text']
    predictions = make_prediction(text)
    return jsonify(predictions=predictions)

# Define API endpoint for data analysis
@app.route('/analyze', methods=['POST'])
def analyze_data():
    data = request.json
    start_date = data['startDate']
    end_date = data['endDate']
    fetched_data = fetch_data(start_date, end_date)
    if not fetched_data:
        return jsonify({"error": "Data fetch failed."}), 500
    vulnerabilities = fetched_data.get("vulnerabilities", [])
    cvss_analysis = analyze_cvss_metrics(vulnerabilities)
    keyword_frequency = analyze_keywords(vulnerabilities)
    cvss_analysis['keywordFrequency'] = keyword_frequency
    return jsonify({"analysisData": cvss_analysis})

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True)
