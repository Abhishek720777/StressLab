import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import NewTest from './pages/NewTest.jsx'
import TestRunner from './pages/TestRunner.jsx'
import Results from './pages/Results.jsx'
import History from './pages/History.jsx'
import Docs from './pages/Docs.jsx'

function PrivateRoute({ children }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { token } = useAuth()
  return !token ? children : <Navigate to="/dashboard" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/new-test" element={<PrivateRoute><NewTest /></PrivateRoute>} />
      <Route path="/run/:runId" element={<PrivateRoute><TestRunner /></PrivateRoute>} />
      <Route path="/results/:runId" element={<PrivateRoute><Results /></PrivateRoute>} />
      <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
      <Route path="/docs" element={<PrivateRoute><Docs /></PrivateRoute>} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
