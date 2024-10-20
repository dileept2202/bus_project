import React, { useState } from 'react';
import './LoginForm.css';
import Inputtag from '../inputtag/inputtag';
import bgimg from '../Assets/bgimg.jpeg';
import { useNavigate } from 'react-router-dom';
import axios from "axios";

const LoginForm = () => {
  const [busId, setBusId] = useState('');
  const [busRegNum, setBusRegNum] = useState('');
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!busId || !busRegNum) {
      alert("Please fill in all fields.");
      return;
    }
  
    try {
      const response = await axios.post("http://localhost:5000/login", { 
        bus_id: busId,  
        bus_regnum: busRegNum
        
      });

      const { status } = response.data;
  
      if (status === "exist") {
        localStorage.setItem('user', JSON.stringify({ busId, busRegNum }));
        // Navigate to /main but pass busId in state
        navigate("/main", { state: { busId } });
        console.log("bb",busId);
      } else if (status === "notexist") {
        alert("User has not signed up");
      }
    } catch (error) {
      console.error("Error details:", error.response?.data || error.message);
      alert("Login failed. Please check your details.");
    }
  };

  
  
  
  

  return (
    <div className='container'>
      <div className='wrapper'>
        <div className='aa'>
          <div className='img_cont'>
            <img src={bgimg} alt="Bus_img" className='side_img' />
          </div>
          <div className='form_cont'>
            <form onSubmit={handleSubmit} className='side_form'>
              <h1 className='heading'>LOGIN PAGE</h1>
              <Inputtag
                label="Bus ID (பேருந்து எண்):"
                placeholder="Enter your Kongu Bus ID"
                type="text"
                value={busId}
                onChange={(e) => setBusId(e.target.value)}
                name="bus_id"
              />
              <Inputtag
                label="Bus Registration Number (பேருந்து பதிவு எண்):"
                placeholder="Enter your Bus Registration Number"
                type='text'
                value={busRegNum}
                onChange={(e) => setBusRegNum(e.target.value)}
                name="bus_regnum"
              />
              <button type='submit' className='button1'>LOGIN</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
