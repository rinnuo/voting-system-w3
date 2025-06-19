import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { User } from "../../models/user";
import { UserService } from "../../services/UserService";

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      if (id) {
        const { password, ...updateData } = form;
        await UserService.update(Number(id), updateData);
        setSuccess("Usuario actualizado correctamente.");
      } else {
        await UserService.create(form as Omit<User, "id"> & { password: string });
        setSuccess("Usuario creado correctamente.");
        setForm(initialState);
      }
      setTimeout(() => navigate("/users/list"), 1000);
    } catch {
      setError("No se pudo guardar el usuario.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">{id ? "Editar Usuario" : "Crear Usuario"}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Usuario</label>
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            required
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>
        {!id && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              name="password"
              type="password"
              value={form.password || ""}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre</label>
          <input
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            required
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Apellido</label>
          <input
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            required
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Rol</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          >
            <option value="SUPER">SUPER</option>
            <option value="PADRON">PADRON</option>
            <option value="ELECCION">ELECCION</option>
            <option value="JURADO">JURADO</option>
          </select>
        </div>
        {error && <div className="text-red-600">{error}</div>}
        {success && <div className="text-green-600">{success}</div>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Guardando..." : "Guardar"}
        </button>
      </form>
    </div>
  );
};

export default UserForm;