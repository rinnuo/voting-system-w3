import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { User } from "../../models/user";
import { UserService } from "../../services/UserService";
import PageContainer from "../../components/PageContainer";
import Form from "../../components/Form";
import Button from "../../components/Button";

const initialState: Omit<User, "role"> & { role: User["role"]; password?: string } = {
  username: "",
  first_name: "",
  last_name: "",
  email: "",
  role: "PADRON",
  password: "",
};

const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      setLoading(true);
      UserService.get(Number(id))
        .then((user) => setForm({ ...user, password: "" }))
        .catch(() => setError("No se pudo cargar el usuario."))
        .finally(() => setLoading(false));
    } else {
      setForm(initialState);
    }
  }, [id]);

  const fields = [
    { name: "username", label: "Usuario", required: true },
    ...(!id
      ? [
          {
            name: "password",
            label: "Contraseña",
            type: "password",
            required: true,
          },
        ]
      : []),
    { name: "first_name", label: "Nombre", required: true },
    { name: "last_name", label: "Apellido", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    {
      name: "role",
      label: "Rol",
      type: "select",
      required: true,
      options: [
        { label: "SUPER", value: "SUPER" },
        { label: "PADRON", value: "PADRON" },
        { label: "ELECCION", value: "ELECCION" },
        { label: "JURADO", value: "JURADO" },
      ],
    },
  ];

  const handleSubmit = async (data: Record<string, any>) => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      if (id) {
        const { password, ...updateData } = data;
        await UserService.update(Number(id), updateData);
        setSuccess("Usuario actualizado correctamente.");
      } else {
        await UserService.create(data as Omit<User, "id"> & { password: string });
        setSuccess("Usuario creado correctamente.");
      }
      setTimeout(() => navigate("/users/list"), 1000);
    } catch {
      setError("No se pudo guardar el usuario.");
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (updated: Partial<typeof form>) => {
    setForm((prev) => ({ ...prev, ...updated }));
  };

  return (
    <PageContainer
      title={id ? "Editar Usuario" : "Crear Usuario"}
      left={
        <Form
          fields={fields}
          values={form}
          onChange={handleFormChange}
          onSubmit={handleSubmit}
          error={error}
          success={success}
          loading={loading}
          actions={
            <Button
              type="submit"
              variant="success"
              disabled={loading}
              className="w-full"
            >
              {loading ? (id ? "Guardando..." : "Creando...") : id ? "Guardar" : "Crear"}
            </Button>
          }
          className="max-w-md"
        />
      }
    />
  );
};

export default UserForm;
