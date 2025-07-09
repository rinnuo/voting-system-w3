import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Recinto } from "../../models/recinto";
import { EleccionService } from "../../services/EleccionService";
import PageContainer from "../../components/PageContainer";
import Form from "../../components/Form";
import LeafletMap from "../../components/LeafletMap";

const initialState: Omit<Recinto, "id"> = {
  nombre: "",
  lat: "-17.783363",
  lng: "-63.182158",
  seccion: 1,
};

const RecintoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [secciones, setSecciones] = useState<{ id: number; nombre: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(!id);

  useEffect(() => {
    EleccionService.listSecciones().then(setSecciones);

    if (id) {
      setLoading(true);
      EleccionService.getRecinto(Number(id))
        .then((recinto) => {
          setForm({
            nombre: recinto.nombre,
            lat: recinto.lat.toString(),
            lng: recinto.lng.toString(),
            seccion: recinto.seccion,
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

  const fields = [
    {
      name: "nombre",
      label: "Nombre",
      required: true,
    },
    {
      name: "lat",
      label: "Latitud",
      type: "number",
      required: true,
    },
    {
      name: "lng",
      label: "Longitud",
      type: "number",
      required: true,
    },
    {
      name: "seccion",
      label: "Sección",
      type: "select",
      required: true,
      options: secciones.map((s) => ({
        label: s.nombre,
        value: s.id,
      })),
    },
  ];

  const handleSubmit = async (data: Record<string, any>) => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    const payload = {
      ...data,
      lat: parseFloat(data.lat),
      lng: parseFloat(data.lng),
      seccion: parseInt(data.seccion),
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

  const handleFormChange = (updated: Partial<Recinto>) => {
    setForm((prev) => ({ ...prev, ...updated }));
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
          fields={fields}
          values={form}
          onChange={handleFormChange}
          onSubmit={handleSubmit}
          error={error}
          success={success}
          loading={loading}
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

export default RecintoForm;
