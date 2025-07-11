import { Routes, Route } from "react-router-dom";
import RoleRoute from "../components/RoleRoute";
import { URLS } from "./CONSTANTS";
import NavBar from "../components/NavBar";
import HomePage from "../pages/HomePage";
import LoginForm from "../pages/LoginForm";
import UserList from "../pages/super/UserList";
import UserForm from "../pages/super/UserForm";
import VotanteList from "../pages/padron/VotanteList";
import VotanteForm from "../pages/padron/VotanteForm";
import SeccionList from "../pages/eleccion/SeccionList";
import SeccionForm from "../pages/eleccion/SeccionForm";
import RecintoList from "../pages/eleccion/RecintoList";
import RecintoForm from "../pages/eleccion/RecintoForm";
import CandidaturaList from "../pages/eleccion/CandidaturaList";
import CandidaturaForm from "../pages/eleccion/CandidaturaForm";
import CargoList from "../pages/eleccion/CargoList";
import CargoForm from "../pages/eleccion/CargoForm";
import EleccionList from "../pages/eleccion/EleccionList";
import EleccionForm from "../pages/eleccion/EleccionForm";
import ParticipacionesPorEleccion from "../pages/eleccion/ParticipacionesPorEleccion";
import MesaList from "../pages/eleccion/MesaList";
import MesaForm from "../pages/eleccion/MesaForm";
import PartidoList from "../pages/eleccion/PartidoList";
import PartidoForm from "../pages/eleccion/PartidoForm";
import PageNotFound from "../pages/PageNotFound";

const RouterConfig = () => (
  <>
    <NavBar />
    <Routes>
      <Route path={URLS.HOME} element={<HomePage />} />
      <Route path={URLS.LOGIN} element={<LoginForm />} />

      <Route path={URLS.USERS.LIST} element={<RoleRoute allowedRoles={["SUPER"]}><UserList /></RoleRoute>} />
      <Route path={URLS.USERS.CREATE} element={<RoleRoute allowedRoles={["SUPER"]}><UserForm /></RoleRoute>} />
      <Route path={URLS.USERS.EDIT} element={<RoleRoute allowedRoles={["SUPER"]}><UserForm /></RoleRoute>} />

      <Route path={URLS.VOTANTES.LIST} element={<RoleRoute allowedRoles={["PADRON"]}><VotanteList /></RoleRoute>} />
      <Route path={URLS.VOTANTES.CREATE} element={<RoleRoute allowedRoles={["PADRON"]}><VotanteForm /></RoleRoute>} />
      <Route path={URLS.VOTANTES.EDIT} element={<RoleRoute allowedRoles={["PADRON"]}><VotanteForm /></RoleRoute>} />

      <Route path={URLS.SECCIONES.LIST} element={<RoleRoute allowedRoles={["ELECCION"]}><SeccionList /></RoleRoute>} />
      <Route path={URLS.SECCIONES.CREATE} element={<RoleRoute allowedRoles={["ELECCION"]}><SeccionForm /></RoleRoute>} />
      <Route path={URLS.SECCIONES.EDIT} element={<RoleRoute allowedRoles={["ELECCION"]}><SeccionForm /></RoleRoute>} />

      <Route path={URLS.RECINTOS.LIST} element={<RoleRoute allowedRoles={["ELECCION"]}><RecintoList /></RoleRoute>} />
      <Route path={URLS.RECINTOS.CREATE} element={<RoleRoute allowedRoles={["ELECCION"]}><RecintoForm /></RoleRoute>} />
      <Route path={URLS.RECINTOS.EDIT} element={<RoleRoute allowedRoles={["ELECCION"]}><RecintoForm /></RoleRoute>} />

      <Route path={URLS.CANDIDATURAS.LIST} element={<RoleRoute allowedRoles={["ELECCION"]}><CandidaturaList /></RoleRoute>} />
      <Route path={URLS.CANDIDATURAS.CREATE} element={<RoleRoute allowedRoles={["ELECCION"]}><CandidaturaForm /></RoleRoute>} />
      <Route path={URLS.CANDIDATURAS.EDIT} element={<RoleRoute allowedRoles={["ELECCION"]}><CandidaturaForm /></RoleRoute>} />

      <Route path={URLS.CARGOS.LIST} element={<RoleRoute allowedRoles={["ELECCION"]}><CargoList /></RoleRoute>} />
      <Route path={URLS.CARGOS.CREATE} element={<RoleRoute allowedRoles={["ELECCION"]}><CargoForm /></RoleRoute>} />
      <Route path={URLS.CARGOS.EDIT} element={<RoleRoute allowedRoles={["ELECCION"]}><CargoForm /></RoleRoute>} />

      <Route path={URLS.ELECCIONES.LIST} element={<RoleRoute allowedRoles={["ELECCION"]}><EleccionList /></RoleRoute>} />
      <Route path={URLS.ELECCIONES.CREATE} element={<RoleRoute allowedRoles={["ELECCION"]}><EleccionForm /></RoleRoute>} />
      <Route path={URLS.ELECCIONES.EDIT} element={<RoleRoute allowedRoles={["ELECCION"]}><ParticipacionesPorEleccion /></RoleRoute>} />
      <Route path={URLS.ELECCIONES.PARTICIPACIONES} element={<RoleRoute allowedRoles={["ELECCION"]}><ParticipacionesPorEleccion /></RoleRoute>} />

      <Route path={URLS.MESAS.LIST} element={<RoleRoute allowedRoles={["ELECCION"]}><MesaList /></RoleRoute>} />
      <Route path={URLS.MESAS.CREATE} element={<RoleRoute allowedRoles={["ELECCION"]}><MesaForm /></RoleRoute>} />
      <Route path={URLS.MESAS.EDIT} element={<RoleRoute allowedRoles={["ELECCION"]}><MesaForm /></RoleRoute>} />

      <Route path={URLS.PARTIDOS.LIST} element={<RoleRoute allowedRoles={["ELECCION"]}><PartidoList /></RoleRoute>} />
      <Route path={URLS.PARTIDOS.CREATE} element={<RoleRoute allowedRoles={["ELECCION"]}><PartidoForm /></RoleRoute>} />
      <Route path={URLS.PARTIDOS.EDIT} element={<RoleRoute allowedRoles={["ELECCION"]}><PartidoForm /></RoleRoute>} />
      
      <Route path="*" element={<PageNotFound/>} />
    </Routes>
  </>
);

export default RouterConfig;