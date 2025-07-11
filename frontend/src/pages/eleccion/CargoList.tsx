import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Cargo } from "../../models/cargo";
import { EleccionService } from "../../services/EleccionService";
import List from "../../components/List";
import PageContainer from "../../components/PageContainer";

const CargoList = () => {
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCargos = async () => {
      try {
        const data = await EleccionService.listCargos();
        setCargos(data);
      } catch {
        setError("No se pudieron cargar los cargos.");
      } finally {
        setLoading(false);
      }
    };
    fetchCargos();
  }, []);

  const handleEdit = (cargo: Cargo) => {
    navigate(`/cargos/${cargo.id}`);
  };

  const handleDelete = async (cargo: Cargo) => {
    if (!window.confirm("¿Seguro que deseas eliminar este cargo?")) return;
    setDeleting(cargo.id);
    try {
      await EleccionService.deleteCargo(cargo.id);
      setCargos((prev) => prev.filter((c) => c.id !== cargo.id));
    } catch {
      alert("No se pudo eliminar el cargo.");
    } finally {
      setDeleting(null);
    }
  };

  const columns = [
    { header: "ID", accessor: "id" as keyof Cargo },
    { header: "Nombre", accessor: "nombre" as keyof Cargo },
    { header: "Descripción", accessor: "descripcion" as keyof Cargo },
    { header: "Elección", accessor: "eleccion_nombre" as keyof Cargo }, // assuming backend sends this
    {
      header: "Secciones",
      accessor: (row: Cargo) => row.secciones.join(", "),
    },
  ];

  return (
    <PageContainer
      title="Lista de Cargos"
      left={
        <List
          data={cargos}
          columns={columns}
          loading={loading}
          error={error}
          onEdit={handleEdit}
          onDelete={handleDelete}
          deleteLabel={deleting ? "Eliminando..." : "Eliminar"}
          emptyMessage="No hay cargos."
        />
      }
    />
  );
};

export default CargoList;
