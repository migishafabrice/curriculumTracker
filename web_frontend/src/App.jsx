import { useState } from 'react'
import {BrowserRouter as Router,Routes,Route} from "react-router-dom";
import './App.css'
import Login from './auth/Login'
import Dashboard from './pages/Dashboard'
import ManageTeachers from "./pages/ManageTeachers";
import ManageDiaries from "./pages/ManageDiaries";
import ManageCurricula from "./pages/ManageCurricula";
import ManageReports from "./pages/ManageReports";
import ErrorBoundary from "./ErrorBoundary";
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<Login/>}/>
          <Route path="/Dashboard" element={<Dashboard/>}/>
          <Route path="/Teachers" element={<ManageTeachers/>}/>
          <Route path="/Diaries" element={<ManageDiaries/>}/>
          <Route path="/Curricula" element={<ManageCurricula/>}/>
          <Route path="/Reports" element={<ManageReports/>}/>
        </Routes>
      </Router>
      </ErrorBoundary>
          </>
  )
}

export default App
