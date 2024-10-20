import React from 'react';
import './inputtag.css';

const Inputtag = ({ label, placeholder, type, required = true, value, onChange }) => {
  return (
    <div className='input_box'>
      <label>{label}</label>
      <input 
        type={type} 
        placeholder={placeholder} 
        required={required} 
        value={value} 
        onChange={onChange} 
      />
    </div>
  );
};

export default Inputtag;
