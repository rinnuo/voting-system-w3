import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Recinto } from "../../models/recinto";
import { EleccionService } from "../../services/EleccionService";
import List from "../../components/List";
import PageContainer from "../../components/PageContainer";
import RecintoLeafletMap from "../../components/RecintoLeafletMap";

const RecintoList = () => {
  const [recintos, setRecintos] = useState<Recinto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecintos = async () => {
      try {
        const data = await EleccionService.listRecintos();
        setRecintos(data);
      } catch {
        setError("No se pudieron cargar los recintos.");
      } finally {
        setLoading(false);
      }
    };
    fetchRecintos();
  }, []);

  const handleEdit = (recinto: Recinto) => {
    navigate(`/recintos/${recinto.id}`);
  };

  const handleDelete = async (recinto: Recinto) => {
    if (!window.confirm("¿Seguro que deseas eliminar este recinto?")) return;
    setDeleting(recinto.id);
    try {
      await EleccionService.deleteRecinto(recinto.id);
      setRecintos((prev) => prev.filter((r) => r.id !== recinto.id));
    } catch {
      alert("No se pudo eliminar el recinto.");
    } finally {
      setDeleting(null);
    }
  };

  const columns = [
    { header: "ID", accessor: "id" as keyof Recinto },
    { header: "Nombre", accessor: "nombre" as keyof Recinto },
    { header: "Latitud", accessor: "lat" as keyof Recinto },
    { header: "Longitud", accessor: "lng" as keyof Recinto },
  ];

  return (
    <PageContainer
      title="Lista de Recintos"
      left={
        <List
          data={recintos}
          columns={columns}
          loading={loading}
          error={error}
          onEdit={handleEdit}
          onDelete={handleDelete}
          deleteLabel={deleting ? "Eliminando..." : "Eliminar"}
          emptyMessage="No hay recintos."
        />
      }
      right={
        <div className="h-full w-[400px] flex items-center">
          <RecintoLeafletMap
            markers={recintos.map((r) => ({
              lat: r.lat,
              lng: r.lng,
              label: r.nombre,
            }))}
            isEditable={false}
          />
        </div>
      }
    />
  );
};

export default RecintoList;