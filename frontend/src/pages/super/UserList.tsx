import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { User } from "../../models/user";
import { UserService } from "../../services/UserService";
import List from "../../components/List";
import PageContainer from "../../components/PageContainer";
import { URLS } from "../../navigation/CONSTANTS";

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

  const handleEdit = (user: User) => {
    navigate(URLS.USERS.EDIT.replace(":id", user.id.toString()));
  };

  const handleDelete = async (user: User) => {
    if (!window.confirm("¿Seguro que deseas eliminar este usuario?")) return;
    setDeleting(user.id);
    try {
      await UserService.delete(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch {
      alert("No se pudo eliminar el usuario.");
    } finally {
      setDeleting(null);
    }
  };

  const columns = [
    { header: "ID", accessor: "id" as keyof User },
    { header: "Usuario", accessor: "username" as keyof User },
    { header: "Nombre Completo", accessor: (row: User) => `${row.first_name} ${row.last_name}` },
    { header: "Email", accessor: "email" as keyof User },
    { header: "Rol", accessor: "role" as keyof User },
  ];

  return (
    <PageContainer
      title="Lista de Usuarios"
      left={
        <List
          data={users}
          columns={columns}
          loading={loading}
          error={error}
          onEdit={handleEdit}
          onDelete={handleDelete}
          deleteLabel={deleting ? "Eliminando..." : "Eliminar"}
          emptyMessage="No hay usuarios."
        />
      }
    />
  );
};

export default UserList;