import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Recinto } from "../../models/recinto";
import type { Seccion } from "../../models/seccion"; // import your real Seccion interface
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

function isPointInPolygon(point: [number, number], vs: [number, number][]): boolean {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0], yi = vs[i][1];
    const xj = vs[j][0], yj = vs[j][1];

    const intersect =
      yi > y !== yj > y &&
      x < ((xj - xi) * (y - yi)) / (yj - yi + 0.0000001) + xi;

    if (intersect) inside = !inside;
  }
  return inside;
}

const RecintoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [secciones, setSecciones] = useState<Seccion[]>([]);
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
    { name: "nombre", label: "Nombre", required: true },
    { name: "lat", label: "Latitud", type: "number", required: true },
    { name: "lng", label: "Longitud", type: "number", required: true },
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


  const flippedPolygon = (poly: [number, number][]) =>
    poly.map(([lng, lat]) => [lat, lng] as [number, number]);

  const handleSubmit = async (data: Record<string, any>) => {
    setError(null);
    setSuccess(null);

    const lat = parseFloat(data.lat);
    const lng = parseFloat(data.lng);
    const seccionId = parseInt(data.seccion);

    const seccion = secciones.find((s) => s.id === seccionId);
    if (!seccion) {
      setError("Sección inválida.");
      return;
    }

    const polygon = flippedPolygon(seccion.poligono);
    const point: [number, number] = [lat, lng];

    const inside = polygon.length >= 3 ? isPointInPolygon(point, polygon) : true;

    if (!inside) {
      setError("⚠️ El marcador debe estar dentro de la sección seleccionada.");
      return;
    }

    setLoading(true);

    const payload = {
      ...data,
      lat,
      lng,
      seccion: seccionId,
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

  const selectedSeccion = secciones.find((s) => s.id === Number(form.seccion));

  const selectedPolygon = selectedSeccion
    ? [
        {
          nombre: selectedSeccion.nombre,
          poligono: flippedPolygon(selectedSeccion.poligono),
        },
      ]
    : [];

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
            polygons={selectedPolygon}
          />
        </div>
      }
    />
  );
};

export default RecintoForm;
