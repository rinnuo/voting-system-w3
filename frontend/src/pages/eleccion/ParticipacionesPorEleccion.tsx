import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Participacion } from "../../models/participacion";
import { EleccionService } from "../../services/EleccionService";
import PageContainer from "../../components/PageContainer";
import List from "../../components/List";

const ParticipacionesPorEleccion = () => {
  const { id } = useParams<{ id: string }>();
  const [participaciones, setParticipaciones] = useState<Participacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    EleccionService.listParticipacionesPorEleccion(Number(id))
      .then((res) => setParticipaciones(res))
      .catch(() => setError("No se pudieron cargar las participaciones."))
      .finally(() => setLoading(false));
  }, [id]);

  const columns = [
    { header: "UUID", accessor: "uuid" as keyof Participacion },
    { header: "Nombre Completo", accessor: "nombreCompleto" as keyof Participacion },
    { header: "Recinto", accessor: "recintoNombre" as keyof Participacion },
    { header: "Mesa", accessor: "mesaNumero" as keyof Participacion },
    { header: "Sección ID", accessor: "seccionId" as keyof Participacion },
  ];

  return (
    <PageContainer
      title={`Participaciones de la Elección ${id}`}
      left={
        <List
          data={participaciones}
          columns={columns}
          loading={loading}
          error={error}
          emptyMessage="No hay participaciones registradas para esta elección."
        />
      }
    />
  );
};

export default ParticipacionesPorEleccion;
