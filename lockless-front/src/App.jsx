import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './page/login';
import Home from './page/home';
import ResetPassword from './page/resetPassword';
import ChangePassword from './page/changePassword';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/reset-password" element={<ResetPassword />}/>
        <Route path="/change-password/:token" element={<ChangePassword  />}/>
      </Routes>
    </Router>
  );
}

export default App;