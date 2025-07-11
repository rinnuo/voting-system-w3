import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Mesa } from "../../models/mesa";
import { EleccionService } from "../../services/EleccionService";
import List from "../../components/List";
import PageContainer from "../../components/PageContainer";

const MesaList = () => {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMesas = async () => {
      try {
        const data = await EleccionService.listMesas();
        setMesas(data);
      } catch {
        setError("No se pudieron cargar las mesas.");
      } finally {
        setLoading(false);
      }
    };
    fetchMesas();
  }, []);

  const handleEdit = (mesa: Mesa) => {
    navigate(`/mesas/${mesa.id}`);
  };

  const handleDelete = async (mesa: Mesa) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta mesa?")) return;
    setDeleting(mesa.id);
    try {
      await EleccionService.deleteMesa(mesa.id);
      setMesas((prev) => prev.filter((m) => m.id !== mesa.id));
    } catch {
      alert("No se pudo eliminar la mesa.");
    } finally {
      setDeleting(null);
    }
  };

  const columns = [
    { header: "ID", accessor: "id" as keyof Mesa },
    { header: "Número", accessor: "numero" as keyof Mesa },
    { header: "Elección", accessor: "eleccion" as keyof Mesa },
    { header: "Recinto", accessor: "recinto_nombre" as keyof Mesa },
  ];

  const groupedByRecinto = mesas.reduce((acc, mesa) => {
    const key = mesa.recinto_nombre || `Recinto ${mesa.recinto}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(mesa);
    return acc;
  }, {} as Record<string, Mesa[]>);

  return (
    <PageContainer
      title="Lista de Mesas"
      left={
        loading ? (
          <div className="text-gray-300">Cargando mesas...</div>
        ) : error ? (
          <div className="text-red-400">{error}</div>
        ) : Object.entries(groupedByRecinto).length === 0 ? (
          <div className="text-gray-400">No hay mesas registradas.</div>
        ) : (
          <>
            {Object.entries(groupedByRecinto).map(([recinto, mesas]) => (
              <div key={recinto} className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-2">
                  {recinto}
                </h2>
                <List
                  data={mesas}
                  columns={columns}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  deleteLabel={deleting ? "Eliminando..." : "Eliminar"}
                  emptyMessage="No hay mesas en este recinto."
                />
              </div>
            ))}
          </>
        )
      }
    />
  );
};

export default MesaList;
