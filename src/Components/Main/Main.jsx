import React, { useState, useEffect } from 'react';
import './Main.css';
import Inputtag from '../inputtag/inputtag';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const Main = () => {
  const location = useLocation(); // Get state from location
  console.log('Full location object:', location); // Log the entire location object
  console.log('Location state:', location.state); // Log the state object

  // Use default value of {} if location.state is undefined
  const { busId } = location.state || {};

  console.log("busId:", busId);
  const [bus_no, setBusNo] = useState(''); // State for bus_no
  const [model, setModel] = useState(''); // State for model
  const [applicant_name, setApplicantName] = useState(''); // State for applicant_name
  const [service_date, setServiceDate] = useState(''); // State for service_date
  const [last_date, setLastDate] = useState(''); // State for last_date
  const [services_done, setServicesDone] = useState([]); // State for services_done
  const [bill, setBill] = useState(null); // State for bill
  const [queries, setQueries] = useState(''); // State for queries

  // Fetch Bus details when component mounts
  useEffect(() => {
    const fetchBusDetails = async () => {
      console.log("Using busId for fetching data:", busId);

      try {
        const response = await axios.get(`http://localhost:5000/bus/${busId}`);
        const busDetails = response.data;

        console.log('Fetched Bus Details:', busDetails);
        if (busDetails.length > 0) {
          setBusNo(busDetails[0].bus_no); // Set bus_no from the response
          setModel(busDetails[0].model); // Set model from the response
        }
      } catch (error) {
        console.error('Error fetching bus details:', error);
      }
    };

    if (busId) { // Check if bus_id exists before fetching
      fetchBusDetails();
    }

  }, [busId]);

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setServicesDone((prevServices) =>
      checked ? [...prevServices, value] : prevServices.filter((service) => service !== value)
    );
  };

  const handleFileChange = (e) => {
    setBill(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form Submitted: ', {
        applicant_name,
        service_date,
        last_date,
        services_done,
        bill,
        queries,
    });

    const formDataToSend = new FormData();
    formDataToSend.append('applicant_name', applicant_name);
    formDataToSend.append('service_date', service_date);
    formDataToSend.append('last_date', last_date);
    services_done.forEach(service => formDataToSend.append('services_done', service));
    formDataToSend.append('bill', bill);
    formDataToSend.append('queries', queries);
    formDataToSend.append('bus_id', busId);
    formDataToSend.append('bus_no', bus_no);

    try {
        // Assign the result of the axios.post call to the response variable
        const response = await axios.post('http://localhost:5000/service-record', formDataToSend, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        // Capture the codeid from the response
        const { codeid } = response.data; 

        // Store the relevant service record data in localStorage if needed
        localStorage.setItem('serviceRecord', JSON.stringify({
            applicant_name,
            service_date,
            last_date,
            services_done,
            bill,
            queries,
            codeid, // You might want to store codeid for future reference as well
        }));
        console.log("code", codeid);

        // Redirect to the summary page with the codeid
        window.location.href = `/summary?codeid=${codeid}`;
    } catch (error) {
        console.error('Error submitting form:', error);
        alert('Error submitting form. Please try again.');
    }
};


  return (
    <div className='bg'>
      <div className='wrapper1'>
        <form onSubmit={handleSubmit}>
          <h1 className='heading'>SERVICE RECORD</h1>
          <h3 className='busdetails'>
            <p>BUS ID: {busId}</p>
            <p>BUS NO: {bus_no}</p>
            <p>MODEL: {model}</p>
          </h3>
          <h4>APPLICANT NAME (விண்ணப்பதாரர் பெயர்):</h4>
          <input
            className='text1'
            placeholder="Name of the Applicant"
            value={applicant_name}
            onChange={(e) => setApplicantName(e.target.value)}
            required
          />
          <Inputtag
            label="SERVICE DATE (சேவை தேதி):"
            type="date"
            value={service_date}
            onChange={(e) => setServiceDate(e.target.value)}
            required
          />
          <Inputtag
            label="NEXT DATE (அடுத்த தேதி):"
            type="date"
            value={last_date}
            onChange={(e) => setLastDate(e.target.value)}
            required
          />
          <h4>SERVICES DONE (சேவைகள் முடிந்தது):</h4>
          {['Oil changes and filter replacements', 'Brake inspections and repairs', 'Engine tune-ups and repairs', 
            'Transmission repairs and replacements', 'Electrical system repairs and maintenance', 
            'Suspension system repairs and maintenance'].map((service) => (
              <div className='checkbox' key={service}>
                <input
                  type="checkbox"
                  value={service}
                  onChange={handleCheckboxChange}
                />
                <label>{service} (Translation)</label>
              </div>
          ))}
          <h4>BILL (ரசீது):</h4>
          <div className='bill'>
            <input
              type='file'
              id="bill-upload"
              accept="image/*"
              onChange={handleFileChange}
              required
            />
            <label htmlFor="bill-upload">Choose File</label>
          </div>
          <h4>ANY QUERIES (ஏதேனும் கேள்விகள்):</h4>
          <div className='queries'>
            <textarea
              placeholder='Leave a comment here'
              value={queries}
              onChange={(e) => setQueries(e.target.value)}
            />
          </div>
          <button className='button2' type='submit'>SUBMIT</button>
        </form>
      </div>
    </div>
  );
};

export default Main;
