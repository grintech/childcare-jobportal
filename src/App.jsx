import React from 'react'
import Homepage from './pages/Homepage'
import { Routes, Route } from 'react-router-dom'
import Register from './pages/auth/Register'
import Login from './pages/auth/Login'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import NotFound from './pages/NotFound'
import HireNow from './pages/HireNow'
import ScrollToTop from './components/ScrollToTop'
import UpSkill from './pages/UpSkill'
import FindJobs from './pages/FindJobs'
import MyAccount from './pages/dashboard/MyAccount'
import PublicRoute from './routes/PublicRoute'
import ProtectedRoute from './routes/ProtectedRoute'
import { Toaster } from 'react-hot-toast'
import PostJob from './pages/PostJob'
import Profile from './pages/dashboard/Profile'
import SavedJobs from './pages/dashboard/SavedJobs'
import AppliedJobs from './pages/dashboard/AppliedJobs'
import JobDetailPage from './pages/JobDetailPage'
import TeacherDetail from './pages/TeacherDetail'
import EmployerDetail from './pages/EmployerDetail'
import GuestOnlyRoute from './routes/GuestOnlyRoute'

const App = () => {
  return (
    <>
    <ScrollToTop />
     <Toaster
        position="top-center"
        reverseOrder={false}
        containerClassName="custom_toaster"
      />
      <Routes>
        <Route path="/" element={<Homepage />} />
       
        {/* Auth Pages */}
        <Route path="/signup" element={<PublicRoute><Register /></PublicRoute> } />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute> } />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute> } />

        {/* Public Pages  */}
        <Route path="/jobs" element={<FindJobs />} />
        <Route path="/profiles" element={<HireNow />} />
        <Route path="/get-trained" element={<UpSkill />} />
        {/* <Route path="/job-post" element={<GuestOnlyRoute><PostJob /></GuestOnlyRoute>} /> */}
        <Route path="/job-post" element={<PostJob />} />
        <Route path="/job/:slug" element={<JobDetailPage />} />
        <Route path="/profile/:slug" element={<TeacherDetail />} />
        <Route path="/company/:slug" element={<EmployerDetail />} />

        {/*  Protected Pages */}
        <Route path="/my-account" element={ <ProtectedRoute ><MyAccount /></ProtectedRoute>} />
        <Route path="/profile" element={ <ProtectedRoute ><Profile /></ProtectedRoute>} />
        <Route path="/saved-jobs" element={ <ProtectedRoute ><SavedJobs /></ProtectedRoute>} />
        <Route path="/applied-jobs" element={ <ProtectedRoute ><AppliedJobs /></ProtectedRoute>} />


        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App