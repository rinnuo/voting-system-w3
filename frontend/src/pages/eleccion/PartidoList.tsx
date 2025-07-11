import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Partido } from "../../models/partido";
import { EleccionService } from "../../services/EleccionService";
import List from "../../components/List";
import PageContainer from "../../components/PageContainer";

const PartidoList = () => {
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPartidos = async () => {
      try {
        const data = await EleccionService.listPartidos();
        setPartidos(data);
      } catch {
        setError("No se pudieron cargar los partidos.");
      } finally {
        setLoading(false);
      }
    };
    fetchPartidos();
  }, []);

  const handleEdit = (partido: Partido) => {
    navigate(`/partidos/${partido.id}`);
  };

  const handleDelete = async (partido: Partido) => {
    if (!window.confirm("¿Seguro que deseas eliminar este partido?")) return;
    setDeleting(partido.id);
    try {
      await EleccionService.deletePartido(partido.id);
      setPartidos((prev) => prev.filter((p) => p.id !== partido.id));
    } catch {
      alert("No se pudo eliminar el partido.");
    } finally {
      setDeleting(null);
    }
  };

  const columns = [
    { header: "ID", accessor: "id" as keyof Partido },
    { header: "Nombre", accessor: "nombre" as keyof Partido },
    { header: "Sigla", accessor: "sigla" as keyof Partido },
    {
      header: "Color",
      accessor: (row: Partido) => (
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded-full border"
            style={{ backgroundColor: row.color }}
          />
          <span>{row.color}</span>
        </div>
      ),
    },
  ];

  return (
    <PageContainer
      title="Lista de Partidos"
      left={
        loading ? (
          <div className="text-gray-300">Cargando partidos...</div>
        ) : error ? (
          <div className="text-red-400">{error}</div>
        ) : partidos.length === 0 ? (
          <div className="text-gray-400">No hay partidos registrados.</div>
        ) : (
          <List
            data={partidos}
            columns={columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
            deleteLabel={deleting ? "Eliminando..." : "Eliminar"}
            emptyMessage="No hay partidos."
          />
        )
      }
    />
  );
};

export default PartidoList;
