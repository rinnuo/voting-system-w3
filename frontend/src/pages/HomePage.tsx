import { useState } from "react";
import type { VotantePublico } from "../models/votante";
import { PadronService } from "../services/PadronService";
import PageContainer from "../components/PageContainer";
import Form from "../components/Form";
import Button from "../components/Button";

const HomePage = () => {
  const [form, setForm] = useState({ ci: "" });
  const [data, setData] = useState<VotantePublico | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fields = [
    {
      name: "ci",
      label: "Ingresa tu CI",
      required: true,
      type: "text",
    },
  ];

  const handleFormChange = (updated: Partial<typeof form>) => {
    setForm((prev) => ({ ...prev, ...updated }));
  };

  const handleSubmit = async (data: typeof form) => {
    setError(null);
    setLoading(true);
    setData(null);
    try {
      const res = await PadronService.getVotantePublico(data.ci.trim());
      setData(res);
    } catch {
      setError("No se encontró un votante con ese CI.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer
      title="Consulta de Padrón Electoral"
      left={
        <Form
          fields={fields}
          values={form}
          onChange={handleFormChange}
          onSubmit={handleSubmit}
          error={error}
          success={null}
          loading={loading}
          actions={
            <Button type="submit" variant="success" disabled={loading} className="w-full">
              {loading ? "Buscando..." : "Buscar"}
            </Button>
          }
          className="max-w-md"
        />
      }
      right={
        <div className="min-w-[280px] m-6">
          {loading && <p className="text-gray-300">Buscando votante…</p>}

          {!loading && data && (
            <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
              <p className="text-lg font-semibold text-green-400">{data.nombreCompleto}</p>
              <p className="text-gray-300">CI: {data.ci}</p>
            </div>
          )}

          {!loading && !data && !error && (
            <p className="text-gray-400">Ingresa un CI para ver la información del votante.</p>
          )}
        </div>
      }
    />
  );
};

export default HomePage;
