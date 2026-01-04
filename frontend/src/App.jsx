import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
 import awkumImage from './public/awkumimg1.png';
import tchrlogo from './public/tchlogo.png';
import stdlgo from './public/stdlogo.png';
import Login from './components/pages/Login';
import Logout from './components/pages/Logout';
import Profile from './components/pages/Profile';
import Singup from './components/pages/Singup';
import Home from './components/pages/Home';
import AuthProvider from './components/context/AuthProvider';
import ProtectedRoute from './components/routes/ProtectRoute';
import Layout from './components/pages/Layout';

const App = () => {
  
 
    return (
      <AuthProvider>
        <Router>
           
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route path="/logout" element={<Logout />} />
              <Route path="/signup" element={<Singup />} />
              <Route path="/login" element={<Login />} />
            </Routes>
           
        </Router>
      </AuthProvider>
    );
};

export default App;
