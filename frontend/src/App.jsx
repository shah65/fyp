import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Login from './components/pages/Login';
import Resources from './components/pages/Resources';
import Singup from './components/pages/Singup';
import Layout from './components/pages/Layout'
import Home from './components/pages/Home';
import AuthProvider from './components/context/AuthProvider';
import ProtectedRoute from './components/routes/ProtectRoute';
import Group from './components/pages/Group';
import UploadProjectModal from './components/pages/UploadProjectModel';
import TeacherLoginPage from './components/adminPages/TeacherLoginPage';
import TeacherSignup from './components/adminPages/TeacherSignup';
import TeacherHome from './components/adminPages/TeacherHome';
import Setting from './components/pages/Setting';
import TeacherSetting from './components/adminPages/TeacherSetting';
import TeacherPendingRequests from './components/adminPages/TeacherPendingRequest';
import TeacherApprovedProjects from './components/adminPages/TeacherApprovedProjects';
import TeacherRejectedPage from './components/adminPages/TeacherRejectedPage';
 

// ── Meeting pages ──────────────────────────────────────────────
import TeacherMeetingsPage from './components/adminPages/TeacherMeetingsPage';
import StudentMeetingsPage from './components/pages/StudentMeetingPage';
import MeetingRoomPage from './components/meeting/MeetingRoom';
import LandingPage from './components/pages/LandingPage';
import Guest from './components/guest/Guest';
import TeacherStudent from './components/adminPages/TeacherStudent';

 

const App = () => {
  
 
    return (
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/guest" element={<Guest />} />
           
            {/* ── Student routes ───────────────────────────────── */}
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
            <Route path="/home" element={
              <ProtectedRoute allowedRoles={['student']}>
                 <Home /> 
              </ProtectedRoute>
            } />
            <Route
              path="/resources"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <Layout><Resources /></Layout>
                     
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
              path="/settings"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <Layout>
                    <Setting />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Student meetings — leader views scheduled/live sessions */}
            <Route path="/student/meetings" element={
              <ProtectedRoute allowedRoles={['student']}>
                <Layout><StudentMeetingsPage /></Layout>
              </ProtectedRoute>
            } />
          
            {/*Teacher Routes */}
            <Route path="/teacher-home" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherHome /></ProtectedRoute>} />
            <Route path="/teacher/settings" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherSetting /></ProtectedRoute>} />
            <Route path="/teacher/pending-request" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherPendingRequests /></ProtectedRoute>} />
            <Route path="/teacher/approved-projects" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherApprovedProjects /></ProtectedRoute>} />
            <Route path="/teacher/rejected-project" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherRejectedPage /></ProtectedRoute>} />
            {/* Teacher meetings — full control dashboard */}
            <Route path="/teacher/meetings" element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherMeetingsPage />
              </ProtectedRoute>
            } />
            {/* Teacher student — page*/}

            <Route path="/teacher/meetings" element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherStudent />
              </ProtectedRoute>
            } />
            {/* ── Shared meeting room (teacher + student) ──────── */}
            {/* No Layout wrapper — room is fullscreen */}
            <Route path="/meeting/room/:roomId" element={
              <ProtectedRoute allowedRoles={['teacher', 'student']}>
                <MeetingRoomPage />
              </ProtectedRoute>
            } />

            {/* ── Auth routes ──────────────────────────────────── */}
            <Route path="/register" element={<Singup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/teacherlogin" element={<TeacherLoginPage />} />
            <Route path="/teacher/signup" element={<TeacherSignup />} />

          </Routes>
        </Router>
      </AuthProvider>
    );
};

export default App;
