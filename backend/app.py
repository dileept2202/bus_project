from flask import Flask, request, jsonify
from flask_mail import Mail, Message
from flask_cors import CORS
import requests
import base64
import os

app = Flask(__name__)

# Enable CORS
CORS(app)

# Configure Flask-Mail for sending emails
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 465
app.config['MAIL_USE_SSL'] = True
app.config['MAIL_USERNAME'] = 'issuesreporter1@gmail.com'  # Replace with your email
app.config['MAIL_PASSWORD'] = 'ttno pyav zqlc czrw'   # Replace with your email password

mail = Mail(app)

# Mock function to fetch service record by codeid (replace with actual database/API call)
def fetch_service_record(codeid):
    try:
        # Fetch the service record from your database or API using codeid
        response = requests.get(f'http://localhost:5000/service-record/{codeid}')
        if response.ok:
            return response.json()
        else:
            raise Exception(f"Could not fetch service record for codeid: {codeid}")
    except Exception as e:
        raise Exception(f"Error fetching service record: {str(e)}")

@app.route('/send-email', methods=['POST'])
def send_email():
    try:
        data = request.get_json()
        codeid = data.get('codeid')

        if not codeid:
            return jsonify({"error": "codeid is required"}), 400

        # Fetch the service record using the provided codeid
        service_record = fetch_service_record(codeid)

        # Prepare email details
        subject = "Service Record Submission with Bill Attachment"
        recipient = "nakofficial03@gmail.com"  # Replace with admin's email address
        body = f"""
        Applicant Name: {service_record['name']}
        Service Date: {service_record['service_date']}
        Next Service Date: {service_record['last_date']}
        Services Done: {service_record['services_done']}
        Queries: {service_record['queries']}
        """

        

        # Create an email message
        msg = Message(subject, sender=app.config['MAIL_USERNAME'], recipients=[recipient])
        msg.body = body

       
        # Send the email
        mail.send(msg)

        return jsonify({"message": "Email sent successfully with bill attached!"}), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
