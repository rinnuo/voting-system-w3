import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "../services/AuthService";
import PageContainer from "../components/PageContainer";
import Form from "../components/Form";
import Button from "../components/Button";
import { URLS } from "../navigation/CONSTANTS";

const LoginForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fields = [
    {
      name: "username",
      label: "Usuario",
      type: "text",
      required: true,
    },
    {
      name: "password",
      label: "Contraseña",
      type: "password",
      required: true,
    },
  ];

  const handleFormChange = (updated: Partial<typeof form>) => {
    setForm((prev) => ({ ...prev, ...updated }));
  };

  const handleSubmit = async (data: typeof form) => {
    setError(null);
    setLoading(true);
    try {
      await AuthService.login(data.username, data.password);
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
          fields={fields}
          values={form}
          onChange={handleFormChange}
          onSubmit={handleSubmit}
          error={error}
          loading={loading}
          actions={
            <Button type="submit" variant="success" disabled={loading} className="w-full">
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
