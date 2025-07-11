import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageContainer from "../../components/PageContainer";
import Form from "../../components/Form";
import Button from "../../components/Button";
import { EleccionService } from "../../services/EleccionService";
import { VotacionService } from "../../services/VotacionService";
import type { Candidatura } from "../../models/candidatura";
import type { Voto } from "../../models/voto";

const initialState: Omit<Voto, "timestamp" | "papeleta"> = {
  candidatura_id: 0,
};

const VotarForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [candidaturas, setCandidaturas] = useState<Candidatura[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) {
      setError("No se especificó una papeleta válida.");
      return;
    }

    EleccionService.listCandidaturas()
      .then((res) => {
        setCandidaturas(res);
        if (res.length > 0) {
          setForm((prev) => ({ ...prev, candidatura_id: res[0].id }));
        }
      })
      .catch(() => setError("No se pudieron cargar las candidaturas."));
  }, [id]);
  

  const selectedCandidatura = candidaturas.find(
    (c) => c.id === form.candidatura_id
  );

  const handleFormChange = (updated: Partial<typeof form>) => {
  if (updated.candidatura_id !== undefined) {
    updated.candidatura_id = Number(updated.candidatura_id);
  }
  setForm((prev) => ({ ...prev, ...updated }));
};


  const handleSubmit = async (data: typeof form) => {
    if (!id) {
      setError("Papeleta inválida.");
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await VotacionService.votar({ ...data, papeleta: id });
      setSuccess("Voto registrado exitosamente.");
      setTimeout(() => navigate("/"), 1000);
    } catch {
      setError("No se pudo registrar el voto.");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      name: "candidatura_id",
      label: "Candidatura",
      type: "select",
      required: true,
      options: candidaturas.map((c) => ({
        label: c.nombres,
        value: c.id,
      })),
    },
  ];

  return (
    <PageContainer
      title={`Formulario de Votación – Papeleta #${id ?? "?"}`}
      left={
        <Form
          fields={fields}
          values={form}
          onChange={handleFormChange}
          onSubmit={handleSubmit}
          error={error}
          success={success}
          loading={loading}
          actions={
            <Button
              type="submit"
              variant="success"
              disabled={loading}
              className="w-full"
            >
              {loading ? "Enviando..." : "Votar"}
            </Button>
          }
          className="max-w-md"
        />
      }
      right={
        <div className="min-w-[280px] m-6">
          {selectedCandidatura ? (
            <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
              <img
                src={selectedCandidatura.foto}
                alt="Foto del candidato"
                className="h-40 w-40 object-cover rounded mx-auto mb-4 border border-gray-600"
              />
              <p className="text-lg font-semibold text-green-400 text-center">
                {selectedCandidatura.nombres}
              </p>
            </div>
          ) : (
            <p className="text-gray-400">
              Selecciona una candidatura para ver su foto.
            </p>
          )}
        </div>
      }
    />
  );
};

export default VotarForm;
