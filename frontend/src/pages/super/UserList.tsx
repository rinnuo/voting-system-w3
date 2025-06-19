import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { User } from "../../models/user";
import { UserService } from "../../services/UserService";

const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await UserService.list();
        setUsers(data);
      } catch {
        setError("No se pudieron cargar los usuarios.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleEdit = (id: number) => {
    navigate(`/users/${id}`);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Seguro que deseas eliminar este usuario?")) return;
    setDeleting(id);
    try {
      await UserService.delete(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {
      alert("No se pudo eliminar el usuario.");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Lista de Usuarios</h1>
      {loading && <div>Cargando...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && (
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4">ID</th>
              <th className="py-2 px-4">Usuario</th>
              <th className="py-2 px-4">Nombre</th>
              <th className="py-2 px-4">Apellido</th>
              <th className="py-2 px-4">Email</th>
              <th className="py-2 px-4">Rol</th>
              <th className="py-2 px-4"></th>
              <th className="py-2 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, idx) => (
              <tr key={u.id} className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                <td className="py-2 px-4">{u.id}</td>
                <td className="py-2 px-4">{u.username}</td>
                <td className="py-2 px-4">{u.first_name}</td>
                <td className="py-2 px-4">{u.last_name}</td>
                <td className="py-2 px-4">{u.email}</td>
                <td className="py-2 px-4">{u.role}</td>
                <td className="py-2 px-4">
                  <button
                    onClick={() => handleEdit(u.id)}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Editar
                  </button>
                </td>
                <td className="py-2 px-4">
                  <button
                    onClick={() => handleDelete(u.id)}
                    disabled={deleting === u.id}
                    className="text-red-600 hover:underline font-medium disabled:opacity-50"
                  >
                    {deleting === u.id ? "Eliminando..." : "Eliminar"}
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={8} className="py-4 text-center text-gray-500">
                  No hay usuarios.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserList;