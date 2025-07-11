import { useEffect, useState } from "react";
import type { Voto } from "../../models/voto";
import { VotacionService } from "../../services/VotacionService";
import List from "../../components/List";
import PageContainer from "../../components/PageContainer";

const VotoList = () => {
  const [votos, setVotos] = useState<Voto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVotos = async () => {
      try {
        const data = await VotacionService.listVotos();
        setVotos(data.map(v => ({ ...v, timestamp: new Date(v.timestamp) })));
      } catch {
        setError("No se pudieron cargar los votos.");
      } finally {
        setLoading(false);
      }
    };
    fetchVotos();
  }, []);

  const columns = [
    { header: "Papeleta", accessor: "papeleta" as keyof Voto },
    { header: "Candidatura ID", accessor: "candidatura_id" as keyof Voto },
    { header: "Fecha y Hora", accessor: (row: Voto) => row.timestamp.toLocaleString() },
  ];

  return (
    <PageContainer
      title="Lista de Votos"
      left={
        <List
          data={votos}
          columns={columns}
          loading={loading}
          error={error}
          emptyMessage="No hay votos registrados."
        />
      }
    />
  );
};

export default VotoList;
