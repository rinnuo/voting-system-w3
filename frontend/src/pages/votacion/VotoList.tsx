import { useEffect, useState } from "react";
import type { Voto } from "../../models/voto";
import type { Candidatura } from "../../models/candidatura";
import { VotacionService } from "../../services/VotacionService";
import { EleccionService } from "../../services/EleccionService";
import List from "../../components/List";
import PageContainer from "../../components/PageContainer";

const VotoList = () => {
  const [votos, setVotos] = useState<Voto[]>([]);
  const [candidaturas, setCandidaturas] = useState<Candidatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [votosData, candidaturasData] = await Promise.all([
          VotacionService.listVotos(),
          EleccionService.listCandidaturas(),
        ]);

        setVotos(votosData.map(v => ({ ...v, timestamp: new Date(v.timestamp) })));
        setCandidaturas(candidaturasData);
        setError(null);
      } catch {
        setError("No se pudieron cargar los votos o candidaturas.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const columns = [
    { header: "Papeleta", accessor: "papeleta" as keyof Voto },
    {
      header: "Candidatura",
      accessor: (row: Voto) => {
        const candidatura = candidaturas.find(c => c.id === row.candidatura_id);
        return candidatura ? (
          <div className="flex items-center space-x-2">
            <img
              src={candidatura.foto}
              alt={candidatura.nombres}
              className="h-12 w-12 object-cover rounded"
            />
            <span>{candidatura.nombres}</span>
          </div>
        ) : (
          "Desconocida"
        );
      },
    },
    {
      header: "Fecha y Hora",
      accessor: (row: Voto) => row.timestamp.toLocaleString(),
    },
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
