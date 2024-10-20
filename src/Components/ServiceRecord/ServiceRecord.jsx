import React, { useEffect, useState } from 'react';
import './ServiceRecord.css';
import { jsPDF } from 'jspdf'; // Import jsPDF
import html2canvas from 'html2canvas'; // Import html2canvas

const Summary = () => {
  const [formData, setFormData] = useState(null);
  const codeid = new URLSearchParams(window.location.search).get('codeid');

  useEffect(() => {
    const fetchData = async () => {
      if (codeid) {
        try {
          const response = await fetch(`http://localhost:5000/service-record/${codeid}`);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          setFormData(data);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      } else {
        console.error('codeid is null or undefined');
      }
    };
    fetchData();
  }, [codeid]);

  const handleDownloadPDF = () => {
    const input = document.getElementById('pdf-content');
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('service_record.pdf');
    });
  };

  const handleSendMail = async () => {
    if (formData) {
      try {
        const response = await fetch('http://127.0.0.1:5000/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ codeid }), // Send the codeid in the request body
        });
  
        if (!response.ok) {
          throw new Error('Failed to send email');
        }
  
        const result = await response.json();
        console.log('Email sent successfully:', result);
        alert('Email sent to admin successfully!');
      } catch (error) {
        console.error('Error sending email:', error);
      }
    }
  };
  

  if (!formData) {
    return <div>Loading...</div>; // Show loading message while fetching data
  }

  return (
    <div className='summary-page'>
      <h1>Service Record</h1>
      <div id="pdf-content"> {/* This div will be captured as a PDF */}
        <p><strong>Applicant Name:</strong> {formData.name}</p>
        <p><strong>Service Date:</strong> {formData.service_date}</p>
        <p><strong>Next Service Date:</strong> {formData.last_date}</p>
        <p><strong>Services Done:</strong> {formData.services_done.split(', ').map(service => (
            <span key={service}>{service}<br /></span>
          ))}</p>
        <p><strong>Queries:</strong> {formData.queries}</p>
      </div>
      <div className='but'>
        <button onClick={handleDownloadPDF} className="download-button">Download as PDF</button>
        <button onClick={handleSendMail} className="mail-button">Send Mail To Admin</button>
      </div>
    </div>
  );
};

export default Summary;
