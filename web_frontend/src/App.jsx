import React from 'react'
import {BrowserRouter as Router,Routes,Route} from "react-router-dom";
import './App.css'
import Login from './auth/Login'
import Dashboard from './pages/Dashboard'
import ManageTeachers from "./pages/ManageTeachers";
import ManageCourses from "./pages/ManageCourses";
import ManageDiaries from "./pages/ManageDiaries";
import ManageCurricula from "./pages/ManageCurricula";
import ManageReports from "./pages/ManageReports";
import ErrorBoundary from "./ErrorBoundary";
import ManageSchools from './pages/ManageSchools';
import ManageDepartments from './pages/ManageDepartments';
import PrivateRoutes from './auth/PrivateRoutes';
import Logout from './auth/Logout';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
const queryClient=new QueryClient();
function App() {
  return (
    <>
     <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Login/>}/>
          <Route element={<PrivateRoutes/>}>
            <Route path="/Dashboard" element={<Dashboard />} />
            <Route path="/Teachers" element={<ManageTeachers />} />
            <Route path="/Courses" element={<ManageCourses />} />
            <Route path="/Diaries" element={<ManageDiaries />} />
            <Route path="/Curricula" element={<ManageCurricula />} />
            <Route path="/Reports" element={<ManageReports />} />
            <Route path="/Schools" element={<ManageSchools />} />
            <Route path="/Departments" element={<ManageDepartments />} />
            <Route path="/Logout" element={<Logout/>}/>
          </Route>
          {/* <Route path="/login" element={<Login />} /> */}
          <Route path="*" element={<Login />} />
        </Routes>
      </Router>
      </QueryClientProvider>
      </ErrorBoundary>
          </>
  )
}

export default App
