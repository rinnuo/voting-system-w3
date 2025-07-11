import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Candidatura } from "../../models/candidatura";
import { EleccionService } from "../../services/EleccionService";
import List from "../../components/List";
import PageContainer from "../../components/PageContainer";

const CandidaturaList = () => {
  const [candidaturas, setCandidaturas] = useState<Candidatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCandidaturas = async () => {
      try {
        const data = await EleccionService.listCandidaturas();
        setCandidaturas(data);
      } catch {
        setError("No se pudieron cargar las candidaturas.");
      } finally {
        setLoading(false);
      }
    };
    fetchCandidaturas();
  }, []);

  const handleEdit = (candidatura: Candidatura) => {
    navigate(`/candidaturas/${candidatura.id}`);
  };

  const handleDelete = async (candidatura: Candidatura) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta candidatura?")) return;
    setDeleting(candidatura.id);
    try {
      await EleccionService.deleteCandidatura(candidatura.id);
      setCandidaturas((prev) => prev.filter((c) => c.id !== candidatura.id));
    } catch {
      alert("No se pudo eliminar la candidatura.");
    } finally {
      setDeleting(null);
    }
  };

  const columns = [
    { header: "ID", accessor: "id" as keyof Candidatura },
    { header: "Nombres", accessor: "nombres" as keyof Candidatura },
    { header: "CI", accessor: "ci" as keyof Candidatura },
		{ header: "Foto", accessor: (row: Candidatura) => row.foto ? <img src={`${row.foto}`} alt="Foto de Candidatura" className="h-32 max-w-full object-contain" /> : "No disponible" },
    { header: "Partido ID", accessor: "partido" as keyof Candidatura },
    { header: "Cargo ID", accessor: "cargo" as keyof Candidatura },
    {
      header: "Secciones",
      accessor: (row: Candidatura) => row.secciones.join(", "),
    },
  ];

  return (
    <PageContainer
      title="Lista de Candidaturas"
      left={
        <List
          data={candidaturas}
          columns={columns}
          loading={loading}
          error={error}
          onEdit={handleEdit}
          onDelete={handleDelete}
          deleteLabel={deleting ? "Eliminando..." : "Eliminar"}
          emptyMessage="No hay candidaturas registradas."
        />
      }
    />
  );
};

export default CandidaturaList;
