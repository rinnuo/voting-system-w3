import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Votante } from "../../models/votante";
import { PadronService } from "../../services/PadronService";
import PageContainer from "../../components/PageContainer";
import Form from "../../components/Form";
import Button from "../../components/Button";

const initialState: Omit<Votante, "id"> = {
  ci: "",
  nombreCompleto: "",
  direccion: "",
  recintoId: 0,
  fotoCIanverso: null,
  fotoCIreverso: null,
  fotoVotante: null,
};

const VotanteForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(!id);

  useEffect(() => {
    if (id) {
      setLoading(true);
      PadronService.getVotante(String(id))
        .then((votante) => {
          setForm({
            ci: votante.ci,
            nombreCompleto: votante.nombreCompleto,
            direccion: votante.direccion,
            recintoId: votante.recintoId,
            fotoCIanverso: null,
            fotoCIreverso: null,
            fotoVotante: null,
          });
          setDataLoaded(true);
        })
        .catch(() => setError("No se pudo cargar el votante."))
        .finally(() => setLoading(false));
    } else {
      setForm(initialState);
      setDataLoaded(true);
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      setForm((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const payload = { ...form };
      if (id) {
        if (!payload.fotoCIanverso) delete payload.fotoCIanverso;
        if (!payload.fotoCIreverso) delete payload.fotoCIreverso;
        if (!payload.fotoVotante) delete payload.fotoVotante;
        await PadronService.updateVotante(String(id), payload);
        setSuccess("Votante actualizado correctamente.");
      } else {
        await PadronService.createVotante(form);
        setSuccess("Votante creado correctamente.");
      }
      setTimeout(() => navigate("/votantes/list"), 1000);
    } catch {
      setError("No se pudo guardar el votante.");
    } finally {
      setLoading(false);
    }
  };

   if (!dataLoaded) {
    return (
      <div className="flex justify-center items-center h-96 text-gray-300">
        Cargando datos del Votante...
      </div>
    );
  }

  return (
    <PageContainer
      title={id ? "Editar Votante" : "Crear Votante"}
      left={
        <Form
          onSubmit={handleSubmit}
          error={error}
          success={success}
          loading={loading}
          fields={
            <>
              <div>
                <label className="block text-sm font-medium text-gray-200">
                  CI
                </label>
                <input
                  name="ci"
                  value={form.ci}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full rounded border border-gray-700 bg-gray-800 text-gray-100 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200">
                  Nombre Completo
                </label>
                <input
                  name="nombreCompleto"
                  value={form.nombreCompleto}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full rounded border border-gray-700 bg-gray-800 text-gray-100 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200">
                  Dirección
                </label>
                <input
                  name="direccion"
                  value={form.direccion}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full rounded border border-gray-700 bg-gray-800 text-gray-100 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200">
                  Recinto&nbsp;ID
                </label>
                <input
                  name="recintoId"
                  type="number"
                  value={form.recintoId.toString()}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full rounded border border-gray-700 bg-gray-800 text-gray-100 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200">
                  Foto CI Anverso
                </label>
                <input
                  name="fotoCIanverso"
                  type="file"
                  onChange={handleFileChange}
                  className="mt-1 w-full rounded border border-gray-700 bg-gray-800 text-gray-100 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200">
                  Foto CI Reverso
                </label>
                <input
                  name="fotoCIreverso"
                  type="file"
                  onChange={handleFileChange}
                  className="mt-1 w-full rounded border border-gray-700 bg-gray-800 text-gray-100 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200">
                  Foto del Votante
                </label>
                <input
                  name="fotoVotante"
                  type="file"
                  onChange={handleFileChange}
                  className="mt-1 w-full rounded border border-gray-700 bg-gray-800 text-gray-100 px-3 py-2"
                />
              </div>
            </>
          }
          actions={
            <Button
              type="submit"
              variant="success"
              disabled={loading}
              className="w-full"
            >
              {loading
                ? "Guardando..."
                : id
                ? "Guardar"
                : "Crear"}
            </Button>
          }
          className="max-w-md"
        />
      }
    />
  );
};

export default VotanteForm;