import { useEffect, useState } from "react";
import type { Papeleta } from "../../models/papeleta";
import { VotacionService } from "../../services/VotacionService";
import List from "../../components/List";
import PageContainer from "../../components/PageContainer";
import { Link } from "react-router-dom";

const PapeletaList = () => {
  const [papeletas, setPapeletas] = useState<Papeleta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [habilitandoId, setHabilitandoId] = useState<string | null>(null);

  const fetchPapeletas = async () => {
    setLoading(true);
    try {
      const data = await VotacionService.listPapeletas();
      setPapeletas(data);
      setError(null);
    } catch {
      setError("No se pudieron cargar las papeletas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapeletas();
  }, []);

  const handleDelete = async (papeleta: Papeleta) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta papeleta?")) return;
    setDeleting(papeleta.id);
    try {
      await VotacionService.deletePapeleta(papeleta.id);
      setPapeletas((prev) => prev.filter((p) => p.id !== papeleta.id));
    } catch {
      alert("No se pudo eliminar la papeleta.");
    } finally {
      setDeleting(null);
    }
  };

  const handleHabilitar = async (papeleta: Papeleta) => {
  setHabilitandoId(papeleta.id);
  try {
    await VotacionService.habilitarPapeleta(papeleta.id);
    alert("Papeleta habilitada con éxito!");
    await fetchPapeletas();
  } catch {
    alert("No se pudo habilitar la papeleta.");
  } finally {
    setHabilitandoId(null);
  }
};

  const columns = [
    { header: "ID", accessor: "id" as keyof Papeleta },
    { header: "ID Votante", accessor: "votante_id" as keyof Papeleta },
    { header: "Mesa", accessor: "mesa_id" as keyof Papeleta },
    { header: "Habilitada", accessor: (row: Papeleta) => (row.habilitada ? "Sí" : "No") },
    { header: "Habilitada Por", accessor: "habilitada_por" as keyof Papeleta },
    { header: "Fecha Habilitada", accessor: (row: Papeleta) => row.habilitada_en.toLocaleString() },
    { header: "Fecha Votada", accessor: (row: Papeleta) => row.votada_en ? row.votada_en.toLocaleString() : "No votada" },
    { header: "Acciones",
      accessor: (row: Papeleta) => {
        const disabled = habilitandoId === row.id || row.habilitada;
        return (
          <button
            disabled={disabled}
            onClick={() => handleHabilitar(row)}
            className={
              disabled
                ? "text-gray-400 cursor-default no-underline"
                : `text-blue-400 underline ${habilitandoId === row.id ? "opacity-50 cursor-not-allowed" : ""}`
            }
          >
            {habilitandoId === row.id
              ? "Habilitando..."
              : row.habilitada
              ? "Habilitada"
              : "Habilitar"}
          </button>
        );
      },
    },
    { header: "Acciones",
      accessor: (row: Papeleta) => {
        const votada = !!row.votada_en;
        return votada ? (
          <span className="text-green-500 font-semibold">Votado</span>
        ) : (
          <Link
            to={`/votar/${row.id}`}
            className="text-blue-500 underline hover:text-blue-700"
          >
            Votar
          </Link>
        );
      },
    }
  ];

  return (
    <PageContainer
      title="Lista de Papeletas"
      left={
        <List
          data={papeletas}
          columns={columns}
          loading={loading}
          error={error}
          onDelete={handleDelete}
          deleteLabel={deleting ? "Eliminando..." : "Eliminar"}
          emptyMessage="No hay papeletas."
        />
      }
    />
  );
};

export default PapeletaList;
