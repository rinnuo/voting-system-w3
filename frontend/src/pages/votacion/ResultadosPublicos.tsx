import { useEffect, useState } from "react";
import PageContainer from "../../components/PageContainer";
import Form from "../../components/Form";
import Button from "../../components/Button";
import { VotacionService } from "../../services/VotacionService";
import { EleccionService } from "../../services/EleccionService";
import type { Eleccion } from "../../models/eleccion";
import type { Seccion } from "../../models/seccion";
import type { Resultado } from "../../models/resultado";

const ResultadosPublicos = () => {
  const [form, setForm] = useState({ eleccion: 0, seccion: 0 });
  const [resultados, setResultados] = useState<Resultado[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [elecciones, setElecciones] = useState<Eleccion[]>([]);
  const [secciones, setSecciones] = useState<Seccion[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [eleccionesData, seccionesData] = await Promise.all([
          EleccionService.listElecciones(),
          EleccionService.listSecciones(),
        ]);
        setElecciones(eleccionesData);
        setSecciones(seccionesData);
      } catch {
        setError("No se pudieron cargar las elecciones o secciones.");
      }
    };
    fetchOptions();
  }, []);

	useEffect(() => {
		if (elecciones.length > 0 && secciones.length > 0) {
			setForm({
				eleccion: elecciones[0].id,
				seccion: secciones[0].id,
			});
		}
	}, [elecciones, secciones]);

  const fields = [
    {
      name: "eleccion",
      label: "Elección",
      type: "select",
      required: true,
      options: elecciones.map((e) => ({ label: e.nombre, value: e.id })),
    },
    {
      name: "seccion",
      label: "Sección",
      type: "select",
      required: true,
      options: secciones.map((s) => ({ label: s.nombre, value: s.id })),
    },
  ];

  const handleFormChange = (updated: Partial<typeof form>) => {
    const parsed = Object.fromEntries(
      Object.entries(updated).map(([k, v]) => [
        k,
        k === "eleccion" || k === "seccion" ? Number(v) : v,
      ])
    );
    setForm((prev) => ({ ...prev, ...parsed }));
  };

  const handleSubmit = async (data: typeof form) => {
    setError(null);
    setLoading(true);
    setResultados(null);
    try {
      const res = await VotacionService.getResultadosPublicos(data.eleccion, data.seccion);
      setResultados(res);
    } catch {
      setError("No se pudieron cargar los resultados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer
      title="Resultados Públicos de Votación"
      left={
        <Form
          fields={fields}
          values={form}
          onChange={handleFormChange}
          onSubmit={handleSubmit}
          error={error}
          loading={loading}
          actions={
            <Button type="submit" variant="success" disabled={loading} className="w-full">
              {loading ? "Cargando..." : "Ver Resultados"}
            </Button>
          }
          className="max-w-md"
        />
      }
      right={
        <div className="min-w-[280px] m-6">
          {loading && <p className="text-gray-300">Cargando resultados…</p>}

          {!loading && resultados && resultados.length > 0 && (
            <div className="space-y-4">
              {resultados.map((r) => (
                <div
                  key={r.candidatura_id}
                  className="rounded border border-gray-700 bg-gray-800 p-4"
                >
                  <p className="text-lg text-green-400 font-semibold mb-1">{r.nombres}</p>
                  <p className="text-gray-300 mb-1">Votos: {r.total}</p>
                  <div className="w-full bg-gray-700 rounded h-4 overflow-hidden">
                    <div
                      className="bg-green-500 h-full"
                      style={{ width: `${r.porcentaje}%` }}
                    ></div>
                  </div>
                  <p className="text-right text-sm text-gray-400 mt-1">
                    {r.porcentaje.toFixed(2)}%
                  </p>
                </div>
              ))}
            </div>
          )}

          {!loading && resultados && resultados.length === 0 && (
            <p className="text-gray-400">No hay resultados para esta combinación.</p>
          )}
        </div>
      }
    />
  );
};

export default ResultadosPublicos;
