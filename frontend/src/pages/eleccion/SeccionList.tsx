import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Seccion } from "../../models/seccion";
import { EleccionService } from "../../services/EleccionService";
import List from "../../components/List";
import PageContainer from "../../components/PageContainer";
import LeafletMap from "../../components/LeafletMap";

const SeccionList = () => {
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSecciones = async () => {
      try {
        const data = await EleccionService.listSecciones();
        setSecciones(data);
      } catch {
        setError("No se pudieron cargar las secciones.");
      } finally {
        setLoading(false);
      }
    };
    fetchSecciones();
  }, []);

  const handleEdit = (seccion: Seccion) => {
    navigate(`/secciones/${seccion.id}`);
  };

  const handleDelete = async (seccion: Seccion) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta sección?")) return;
    setDeleting(seccion.id);
    try {
      await EleccionService.deleteSeccion(seccion.id);
      setSecciones((prev) => prev.filter((s) => s.id !== seccion.id));
    } catch {
      alert("No se pudo eliminar la sección.");
    } finally {
      setDeleting(null);
    }
  };

  const columns = [
    { header: "ID", accessor: "id" as keyof Seccion },
    { header: "Nombre", accessor: "nombre" as keyof Seccion },
    { header: "Descripción", accessor: "descripcion" as keyof Seccion },
  ];

  const flippedPolygons = secciones.map((s) =>
    s.poligono.map(([lng, lat]) => [lat, lng] as [number, number])
  );

  const polygonsForMap = secciones.map((s, i) => ({
    nombre: s.nombre,
    poligono: flippedPolygons[i],
  }));

  return (
    <PageContainer
      title="Lista de Secciones"
      left={
        <List
          data={secciones}
          columns={columns}
          loading={loading}
          error={error}
          onEdit={handleEdit}
          onDelete={handleDelete}
          deleteLabel={deleting ? "Eliminando..." : "Eliminar"}
          emptyMessage="No hay secciones."
        />
      }
      right={
        <div className="h-full w-[400px] flex items-center">
          <LeafletMap
            polygons={polygonsForMap}
            isEditable={false}
          />
        </div>
      }
    />
  );
};

export default SeccionList;
