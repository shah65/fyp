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
import TeacherSignup from './components/adminPages/TeacherSignup';
import TeacherHome from './components/adminPages/TeacherHome';
 
 

const App = () => {
  
 
    return (
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/teacherlogin" element={<TeacherLoginPage />} />
            <Route path="/teacher/signup" element={<TeacherSignup />} />

            <Route path="/teacher-home" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherHome /></ProtectedRoute>} />

            <Route
              path="/group"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <Layout>
                    <Group />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/resources"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <UploadProjectModal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/project/:id"
              element={
                <ProtectedRoute allowedRoles={['student']}>
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
