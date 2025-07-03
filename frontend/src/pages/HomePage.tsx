import { useState } from "react";
import type { VotantePublico } from "../models/votante";
import { PadronService } from "../services/PadronService";
import PageContainer from "../components/PageContainer";
import Form from "../components/Form";
import Button from "../components/Button";

const HomePage = () => {
  const [ci, setCi] = useState("");
  const [data, setData] = useState<VotantePublico | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setCi(e.target.value);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setData(null);

    try {
      const res = await PadronService.getVotantePublico(ci.trim());
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
          onSubmit={handleSubmit}
          error={error}
          success={null}
          loading={loading}
          fields={
            <div>
              <label className="block text-sm font-medium text-gray-200">
                Ingresa tu&nbsp;CI
              </label>
              <input
                name="ci"
                value={ci}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded border border-gray-700 bg-gray-800 text-gray-100 px-3 py-2"
              />
            </div>
          }
          actions={
            <Button
              type="submit"
              variant="success"
              disabled={loading}
              className="w-full"
            >
              {loading ? "Buscando..." : "Buscar"}
            </Button>
          }
          className="max-w-md"
        />
      }
      right={
        <div className="min-w-[280px]">
          {loading && (
            <p className="text-gray-300">Buscando votante…</p>
          )}

          {!loading && data && (
            <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
              <p className="text-lg font-semibold text-green-400">
                {data.nombreCompleto}
              </p>
              <p className="text-gray-300">CI:&nbsp;{data.ci}</p>
              <p className="text-gray-300">
                Recinto:&nbsp;{data.nombreRecinto} (ID&nbsp;{data.recintoId})
              </p>
            </div>
          )}

          {!loading && !data && !error && (
            <p className="text-gray-400">
              Ingresa un&nbsp;CI para ver la información del votante.
            </p>
          )}
        </div>
      }
    />
  );
};

export default HomePage;
