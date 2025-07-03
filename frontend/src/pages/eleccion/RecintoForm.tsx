import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Recinto } from "../../models/recinto";
import { EleccionService } from "../../services/EleccionService";
import PageContainer from "../../components/PageContainer";
import Form from "../../components/Form";
import Button from "../../components/Button";
import RecintoLeafletMap from "../../components/RecintoLeafletMap";

const initialState: Omit<Recinto, "id"> = {
  nombre: "",
  lat: "-17.783363",
  lng: "-63.182158",
};

const RecintoForm = () => {
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
      EleccionService.getRecinto(Number(id))
        .then((recinto) => {
          setForm({
            nombre: recinto.nombre,
            lat: recinto.lat.toString(),
            lng: recinto.lng.toString(),
          });
          setDataLoaded(true);
        })
        .catch(() => setError("No se pudo cargar el recinto."))
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const payload = {
      ...form,
      lat: typeof form.lat === "number" ? Number(form.lat.toFixed(6)) : form.lat,
      lng: typeof form.lng === "number" ? Number(form.lng.toFixed(6)) : form.lng,
    };

    try {
      if (id) {
        await EleccionService.updateRecinto(Number(id), payload);
        setSuccess("Recinto actualizado correctamente.");
      } else {
        await EleccionService.createRecinto(payload);
        setSuccess("Recinto creado correctamente.");
      }
      setTimeout(() => navigate("/recintos/list"), 1000);
    } catch {
      setError("No se pudo guardar el recinto.");
    } finally {
      setLoading(false);
    }
  };

  const safeLat = parseFloat(form.lat);
  const safeLng = parseFloat(form.lng);

  if (!dataLoaded) {
    return (
      <div className="flex justify-center items-center h-96 text-gray-300">
        Cargando datos del recinto...
      </div>
    );
  }

  return (
    <PageContainer
      title={id ? "Editar Recinto" : "Crear Recinto"}
      left={
        <Form
          onSubmit={handleSubmit}
          error={error}
          success={success}
          loading={loading}
          fields={
            <>
              <div>
                <label className="block text-sm font-medium text-gray-200">Nombre</label>
                <input
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full rounded border border-gray-700 bg-gray-800 text-gray-100 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200">Latitud</label>
                <input
                  name="lat"
                  type="number"
                  step="any"
                  value={form.lat}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full rounded border border-gray-700 bg-gray-800 text-gray-100 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200">Longitud</label>
                <input
                  name="lng"
                  type="number"
                  step="any"
                  value={form.lng}
                  onChange={handleChange}
                  required
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
      right={
        <div className="h-full w-[400px] flex items-center">
          <RecintoLeafletMap
            markers={[{ lat: !isNaN(safeLat) ? safeLat : -17.783, lng: !isNaN(safeLng) ? safeLng : -63.18 }]}
            isEditable={true}
            onMapClick={(lat, lng) => setForm((prev) => ({ ...prev, lat: lat.toString(), lng: lng.toString() }))}
            onMarkerDrag={(lat, lng) => setForm((prev) => ({ ...prev, lat: lat.toString(), lng: lng.toString() }))}
          />
        </div>
      }
    />
  );
};

export default RecintoForm;