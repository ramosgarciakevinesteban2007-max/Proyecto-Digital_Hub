import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import RecuperarPassword from './pages/RecuperarPassword';
import VerificarCodigo from './pages/VerificarCodigo';
import NuevaPassword from './pages/NuevaPassword';
import FuelDevs from './pages/FuelDevs';

import InicioAdmin from './pages/admin/Inicio';
import EquiposAdmin from './pages/admin/EquiposAdmin';
import HistorialAdmin from './pages/admin/HistorialAdmin';
import AjustesAdmin from './pages/admin/AjustesAdmin';
import UsuariosAdmin from './pages/admin/UsuariosAdmin';
import ReportesAdmin from './pages/admin/ReportesAdmin';
import FichasAdmin from './pages/admin/FichasAdmin';
import { Navigate } from 'react-router-dom';

import InicioInstructor from './pages/instructor/InicioInstructor';
import EquiposInstructor from './pages/instructor/EquiposInstructor';
import ReportesInstructor from './pages/instructor/ReportesInstructor';
import HistorialInstructor from './pages/instructor/HistorialInstructor';
import AjustesInstructor from './pages/instructor/AjustesInstructor';
import FichasInstructor from './pages/instructor/FichasInstructor';
import UsuariosInstructor from './pages/instructor/UsuariosInstructor';

import InicioAprendiz from './pages/aprendiz/InicioAprendiz';
import EquiposAprendiz from './pages/aprendiz/EquiposAprendiz';
import ReportesAprendiz from './pages/aprendiz/ReportesAprendiz';
import HistorialAprendiz from './pages/aprendiz/HistorialAprendiz';
import AjustesAprendiz from './pages/aprendiz/AjustesAprendiz';
import FichasAprendiz from './pages/aprendiz/FichasAprendiz';
import MiDispositivo from './pages/aprendiz/MiDispositivo';
import MiFicha from './pages/aprendiz/MiFicha';
import Notificaciones from './pages/Notificaciones';

import './App.css';
import './theme-claro.css';

// Aplicar tema guardado antes del primer render
const temaGuardado = localStorage.getItem('tema') || 'oscuro';
document.documentElement.setAttribute('data-theme', temaGuardado);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/registrarse" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/recuperar-password" element={<RecuperarPassword />} />
        <Route path="/verificar-codigo" element={<VerificarCodigo />} />
        <Route path="/nueva-password" element={<NuevaPassword />} />
        <Route path="/fuel-devs" element={<FuelDevs />} />

        <Route path="/admin/inicio"      element={<InicioAdmin />} />
        <Route path="/admin/equipos"     element={<EquiposAdmin />} />
        <Route path="/admin/historial"   element={<HistorialAdmin />} />
        <Route path="/admin/ajustes"     element={<AjustesAdmin />} />
        <Route path="/admin/usuarios"    element={<UsuariosAdmin />} />
        <Route path="/admin/reportes"    element={<ReportesAdmin />} />
        <Route path="/admin/comentarios" element={<ReportesAdmin />} />
        <Route path="/admin/ambientes"   element={<Navigate to="/admin/fichas" replace />} />
        <Route path="/admin/fichas"      element={<FichasAdmin />} />

        <Route path="/instructor/inicio"      element={<InicioInstructor />} />
        <Route path="/instructor/equipos"     element={<EquiposInstructor />} />
        <Route path="/instructor/reportes"    element={<ReportesInstructor />} />
        <Route path="/instructor/comentarios" element={<ReportesInstructor />} />
        <Route path="/instructor/usuarios"    element={<UsuariosInstructor />} />
        <Route path="/instructor/historial"   element={<HistorialInstructor />} />
        <Route path="/instructor/ajustes"     element={<AjustesInstructor />} />
        <Route path="/instructor/fichas"      element={<FichasInstructor />} />
        <Route path="/instructor/ficha"       element={<Navigate to="/instructor/fichas" replace />} />

        <Route path="/aprendiz/inicio"      element={<InicioAprendiz />} />
        <Route path="/aprendiz/equipos"     element={<EquiposAprendiz />} />
        <Route path="/aprendiz/reportes"    element={<ReportesAprendiz />} />
        <Route path="/aprendiz/historial"   element={<HistorialAprendiz />} />
        <Route path="/aprendiz/ajustes"     element={<AjustesAprendiz />} />
        <Route path="/aprendiz/fichas"      element={<FichasAprendiz />} />
        <Route path="/aprendiz/dispositivo" element={<MiDispositivo />} />
        <Route path="/aprendiz/ficha"       element={<MiFicha />} />
        <Route path="/notificaciones"      element={<Notificaciones />} />
      </Routes>
    </Router>
  );
}

export default App;
