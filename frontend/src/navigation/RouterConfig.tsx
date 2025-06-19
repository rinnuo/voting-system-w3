import { Routes, Route } from "react-router-dom";
import { URLS } from "./CONSTANTS";
import NavBar from "../components/NavBar";
import LoginForm from "../pages/LoginForm";
import UserList from "../pages/super/UserList";
import UserForm from "../pages/super/UserForm";

const RouterConfig = () => (
  <>
    <NavBar />
    <Routes>
      <Route path={URLS.LOGIN} element={<LoginForm />} />
      <Route path={URLS.USERS.LIST} element={<UserList />} />
      <Route path={URLS.USERS.CREATE} element={<UserForm />} />
      <Route path={URLS.USERS.EDIT} element={<UserForm />} />
    </Routes>
  </>
);

export default RouterConfig;