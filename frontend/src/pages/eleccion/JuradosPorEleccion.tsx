import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Jurado } from "../../models/jurado";
import { EleccionService } from "../../services/EleccionService";
import PageContainer from "../../components/PageContainer";
import List from "../../components/List";

const JuradosPorEleccion = () => {
  const { id } = useParams<{ id: string }>();
  const [jurados, setJurados] = useState<Jurado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    EleccionService.listJuradosByEleccion(Number(id))
      .then((res) => {
        const withKeys = res.map((j) => ({ ...j, key: j.id }));
        setJurados(withKeys);
      })
      .catch(() => setError("No se pudieron cargar los jurados."))
      .finally(() => setLoading(false));
  }, [id]);

  const columns = [
    { header: "ID", accessor: "id" as keyof Jurado },
    { header: "Mesa", accessor: "mesa" as keyof Jurado },
    { header: "Participante ID", accessor: "participante_id" as keyof Jurado },
    { header: "Usuario", accessor: "username" as keyof Jurado },
  ];


  return (
    <PageContainer
      title={`Jurados de la Elección ${id}`}
      left={
        <List
          data={jurados}
          columns={columns}
          loading={loading}
          error={error}
          emptyMessage="No hay jurados registrados para esta elección."
        />
      }
    />
  );
};

export default JuradosPorEleccion;
