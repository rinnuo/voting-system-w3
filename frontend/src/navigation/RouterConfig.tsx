import { Routes, Route } from "react-router-dom";
import RoleRoute from "../components/RoleRoute";
import { URLS } from "./CONSTANTS";
import NavBar from "../components/NavBar";
import HomePage from "../pages/HomePage";
import LoginForm from "../pages/LoginForm";
import UserList from "../pages/super/UserList";
import UserForm from "../pages/super/UserForm";
import RecintoList from "../pages/eleccion/RecintoList";
import RecintoForm from "../pages/eleccion/RecintoForm";
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

      <Route path={URLS.RECINTOS.LIST} element={<RoleRoute allowedRoles={["ELECCION"]}><RecintoList /></RoleRoute>} />
      <Route path={URLS.RECINTOS.CREATE} element={<RoleRoute allowedRoles={["ELECCION"]}><RecintoForm /></RoleRoute>} />
      <Route path={URLS.RECINTOS.EDIT} element={<RoleRoute allowedRoles={["ELECCION"]}><RecintoForm /></RoleRoute>} />
      
      <Route path="*" element={<PageNotFound/>} />
    </Routes>
  </>
);

export default RouterConfig;