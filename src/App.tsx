import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import Perfil from './pages/Perfil'
import NuevaReceta from './pages/NuevaReceta'
import DetalleReceta from './pages/DetalleReceta'
import Login from './pages/Login'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/nueva-receta" element={<NuevaReceta />} />
          <Route path="/receta/:id" element={<DetalleReceta />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
