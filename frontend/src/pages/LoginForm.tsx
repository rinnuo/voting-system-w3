import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "../services/AuthService";
import PageContainer from "../components/PageContainer";
import Form from "../components/Form";
import Button from "../components/Button";
import { URLS } from "../navigation/CONSTANTS";

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await AuthService.login(username, password);
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      switch (user.role) {
        case "SUPER":
          navigate(URLS.USERS.LIST);
          break;
        case "PADRON":
          navigate(URLS.HOME);
          break;
        case "ELECCION":
          navigate(URLS.RECINTOS.LIST);
          break;
        case "JURADO":
          navigate(URLS.HOME);
          break;
      }
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer
      title="Iniciar Sesión"
      left={
        <Form
          onSubmit={handleSubmit}
          error={error}
          loading={loading}
          fields={
            <>
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-200">
                  Usuario
                </label>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 w-full rounded border border-gray-700 bg-gray-800 text-gray-100 px-3 py-2"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-200">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded border border-gray-700 bg-gray-800 text-gray-100 px-3 py-2"
                  required
                />
              </div>
            </>
          }
          actions={
            <Button
              type="submit"
              variant="success"
              disabled={loading}
              className="w-full"
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </Button>
          }
          className="max-w-md"
        />
      }
    />
  );
};

export default LoginForm;