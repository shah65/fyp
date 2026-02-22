import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Login from './components/pages/Login';
import Profile from './components/pages/Profile';
import Singup from './components/pages/Singup';
import Layout from './components/pages/Layout'
import Home from './components/pages/Home';
import AuthProvider from './components/context/AuthProvider';
import ProtectedRoute from './components/routes/ProtectRoute';
import Group from './components/pages/Group';
import UploadProjectModal from './components/pages/UploadProjectModel';
import ViewProject from './components/pages/ViewProject';
import TeacherLoginPage from './components/adminPages/TeacherLoginPage';
 
 

const App = () => {
  
 
    return (
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/teacherlogin" element={<TeacherLoginPage />} />
            <Route
              path="/group"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Group />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <UploadProjectModal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/project/:id"
              element={
                <ProtectedRoute>
                  <ViewProject />
                </ProtectedRoute>
              }
            />
            <Route path="/signup" element={<Singup />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </Router>
      </AuthProvider>
    );
};

export default App;
