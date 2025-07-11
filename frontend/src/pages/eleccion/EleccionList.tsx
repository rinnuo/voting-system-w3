import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Eleccion } from "../../models/eleccion";
import { EleccionService } from "../../services/EleccionService";
import List from "../../components/List";
import PageContainer from "../../components/PageContainer";

const EleccionList = () => {
  const [elecciones, setElecciones] = useState<Eleccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchElecciones = async () => {
      try {
        const data = await EleccionService.listElecciones();
        setElecciones(data);
      } catch {
        setError("No se pudieron cargar las elecciones.");
      } finally {
        setLoading(false);
      }
    };
    fetchElecciones();
  }, []);

  const handleEdit = (eleccion: Eleccion) => {
    navigate(`/elecciones/${eleccion.id}`);
  };

  const handleDelete = async (eleccion: Eleccion) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta elección?")) return;
    setDeleting(eleccion.id);
    try {
      await EleccionService.deleteEleccion(eleccion.id);
      setElecciones((prev) => prev.filter((e) => e.id !== eleccion.id));
    } catch {
      alert("No se pudo eliminar la elección.");
    } finally {
      setDeleting(null);
    }
  };

  const columns = [
    { header: "ID", accessor: "id" as keyof Eleccion },
    { header: "Nombre", accessor: "nombre" as keyof Eleccion },
    { 
      header: "Tipo", 
      accessor: "tipo" as keyof Eleccion 
    },
    { 
      header: "Fecha", 
      accessor: (row: Eleccion) => new Date(row.fecha).toLocaleDateString(),
    },
    { 
      header: "Activa", 
      accessor: (row: Eleccion) => (row.activa ? "Sí" : "No"),
    },
    {
			header: "Secciones",
			accessor: (row: Eleccion) => Array.isArray(row.secciones) ? row.secciones.join(", ") : "",
		},
		{
			header: "Acciones",
			accessor: (row: Eleccion) => (
				<button
					className="text-blue-400 underline"
					onClick={() => navigate(`/elecciones/${row.id}/participaciones`)}
				>
					Ver Participantes
				</button>
			),
		}
  ];

  return (
    <PageContainer
      title="Lista de Elecciones"
      left={
        <List
          data={elecciones}
          columns={columns}
          loading={loading}
          error={error}
          onEdit={handleEdit}
          onDelete={handleDelete}
          deleteLabel={deleting ? "Eliminando..." : "Eliminar"}
          emptyMessage="No hay elecciones registradas."
        />
      }
    />
  );
};

export default EleccionList;
