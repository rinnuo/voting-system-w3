import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Votante } from "../../models/votante";
import { PadronService } from "../../services/PadronService";
import PageContainer from "../../components/PageContainer";
import Form from "../../components/Form";
import LeafletMap from "../../components/LeafletMap";
import Button from "../../components/Button";

const initialState: Omit<Votante, "id"> = {
  ci: "",
  nombreCompleto: "",
  direccion: "",
  lat: "-17.783363",
  lng: "-63.182158",
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
            lat: votante.lat.toString(),
            lng: votante.lng.toString(),
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

  const handleChange = (updated: Partial<Votante>) => {
    setForm((prev) => ({ ...prev, ...updated }));
  };

  const handleSubmit = async (data: Record<string, any>) => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    const payload = {
      ...data,
      lat: parseFloat(data.lat),
      lng: parseFloat(data.lng),
    };

    try {
      if (id) {
        if (!payload.fotoCIanverso) delete payload.fotoCIanverso;
        if (!payload.fotoCIreverso) delete payload.fotoCIreverso;
        if (!payload.fotoVotante) delete payload.fotoVotante;
        await PadronService.updateVotante(String(id), payload);
        setSuccess("Votante actualizado correctamente.");
      } else {
        await PadronService.createVotante(payload);
        setSuccess("Votante creado correctamente.");
      }
      setTimeout(() => navigate("/votantes/list"), 1000);
    } catch {
      setError("No se pudo guardar el votante.");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: "ci", label: "CI", required: true },
    { name: "nombreCompleto", label: "Nombre Completo", required: true },
    { name: "direccion", label: "Dirección", required: true },
    { name: "fotoCIanverso", label: "Foto CI Anverso", type: "file" },
    { name: "fotoCIreverso", label: "Foto CI Reverso", type: "file" },
    { name: "fotoVotante", label: "Foto del Votante", type: "file" },
    { name: "lat", label: "Latitud", type: "number", required: true },
    { name: "lng", label: "Longitud", type: "number", required: true },
  ];

  const safeLat = parseFloat(form.lat);
  const safeLng = parseFloat(form.lng);

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
          fields={fields}
          values={form}
          onChange={handleChange}
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
      right={
        <div className="h-full w-[400px] flex items-center">
          <LeafletMap
            markers={[{ lat: safeLat, lng: safeLng }]}
            isEditable={true}
            onMapClick={(lat, lng) =>
              setForm((prev) => ({
                ...prev,
                lat: lat.toFixed(6).toString(),
                lng: lng.toFixed(6).toString(),
              }))
            }
            onMarkerDrag={(lat, lng) =>
              setForm((prev) => ({
                ...prev,
                lat: lat.toFixed(6).toString(),
                lng: lng.toFixed(6).toString(),
              }))
            }
          />
        </div>
      }
    />
  );
};

export default VotanteForm;
