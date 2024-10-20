import './App.css';
import LoginForm from './Components/LoginForm/LoginForm';
import Main from './Components/Main/Main';
import ServiceRecord from './Components/ServiceRecord/ServiceRecord';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/main" element={<Main />} />
        <Route path="/main/:bus_id" element={<Main />} /> {/* This expects a bus_id */}
        <Route path="/summary" element={<ServiceRecord />} />
      </Routes>

    </Router>
  );
}

export default App;
