import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Seccion } from "../../models/seccion";
import { EleccionService } from "../../services/EleccionService";
import PageContainer from "../../components/PageContainer";
import Form from "../../components/Form";
import LeafletMap from "../../components/LeafletMap";

const initialState: Omit<Seccion, "id"> = {
  nombre: "",
  descripcion: "",
  poligono: [],
};

const fields = [
  { name: "nombre", label: "Nombre", required: true },
  { name: "descripcion", label: "Descripción", required: false, type: "textarea" },
  { name: "poligono", label: "Polígono ([lng, lat] [lng, lat])", required: true, type: "text" },
];

const SeccionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialState);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(!id);

 
  const [polygonPoints, setPolygonPoints] = useState<[number, number][]>([]);
  const [polygonPointsString, setPolygonPointsString] = useState("");

  const flipPolygon = (poly: [number, number][]) =>
    poly.map(([lng, lat]) => [lat, lng] as [number, number]);

  const formatPointsString = (points: [number, number][]) =>
    points.map(([lng, lat]) => `[${lng},${lat}]`).join(" ");

  const parsePointsString = (str: string): [number, number][] | null => {
    const regex = /\[\s*(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)\s*\]/g;
    const matches = Array.from(str.matchAll(regex));
    if (matches.length === 0) return [];
    const points: [number, number][] = [];
    for (const m of matches) {
      const lng = parseFloat(m[1]);
      const lat = parseFloat(m[3]);
      if (isNaN(lng) || isNaN(lat)) return null;
      points.push([lng, lat]);
    }
    return points;
  };

  useEffect(() => {
    if (id) {
      setLoading(true);
      EleccionService.getSeccion(Number(id))
        .then((data) => {
          setForm({
            nombre: data.nombre,
            descripcion: data.descripcion,
            poligono: data.poligono,
          });
          setPolygonPoints(data.poligono || []);
          setDataLoaded(true);
        })
        .catch(() => setError("No se pudo cargar la sección."))
        .finally(() => setLoading(false));
    } else {
      setForm(initialState);
      setPolygonPoints([]);
      setDataLoaded(true);
    }
  }, [id]);

  useEffect(() => {
    setPolygonPointsString(formatPointsString(polygonPoints));
  }, [polygonPoints]);

  useEffect(() => {
    if (form.poligono) {
      setPolygonPoints(form.poligono);
    }
  }, [form.poligono]);

  const onPolygonInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPolygonPointsString(value);
    const parsed = parsePointsString(value);
    if (parsed === null) {
      setError("Formato inválido. Usa: [lng,lat] [lng,lat] ...");
      return;
    }
    setError(null);
    setPolygonPoints(parsed);
    setForm((prev) => ({
      ...prev,
      poligono: parsed,
    }));
  };

  const onDrawPoint = (point: [number, number]) => {
    setPolygonPoints((prev) => {
      const newPoints = [...prev, point];
      setForm((prevForm) => ({
        ...prevForm,
        poligono: newPoints,
      }));
      setError(null);
      return newPoints;
    });
  };

  const handleFormChange = (updated: Partial<Seccion>) => {
    setForm((prev) => ({ ...prev, ...updated }));
  };

  const handleSubmit = async (data: Record<string, any>) => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!form.poligono || form.poligono.length < 3) {
      setError("El polígono debe tener al menos 3 puntos.");
      setLoading(false);
      return;
    }

    const payload = {
      nombre: data.nombre,
      descripcion: data.descripcion,
      poligono: form.poligono,
    };

    try {
      if (id) {
        await EleccionService.updateSeccion(Number(id), payload);
        setSuccess("Sección actualizada correctamente.");
      } else {
        await EleccionService.createSeccion(payload);
        setSuccess("Sección creada correctamente.");
      }
      setTimeout(() => navigate("/secciones/list"), 1000);
    } catch {
      setError("No se pudo guardar la sección.");
    } finally {
      setLoading(false);
    }
  };

  if (!dataLoaded) {
    return (
      <div className="flex justify-center items-center h-96 text-gray-300">
        Cargando datos de la sección...
      </div>
    );
  }

  return (
    <PageContainer
      title={id ? "Editar Sección" : "Crear Sección"}
      left={
        <>
          <Form
            fields={fields}
            values={{ ...form, poligono: polygonPointsString }}
            onChange={(updated) => {
              if ("poligono" in updated) {
                onPolygonInputChange({ target: { value: updated.poligono } } as any);
              } else {
                handleFormChange(updated);
              }
            }}
            onSubmit={handleSubmit}
            error={error}
            success={success}
            loading={loading}
            className="max-w-md"
          />
        </>
      }
      right={
        <div className="h-full w-[400px] flex items-center">
          <LeafletMap
            polygons={
              polygonPoints.length
                ? [{ nombre: form.nombre || "Polígono", poligono: flipPolygon(polygonPoints) }]
                : []
            }
            isEditable={true}
            drawPolygonMode={true}
            polygonPoints={polygonPoints}
            onDrawPoint={onDrawPoint}
          />
        </div>
      }
    />
  );
};

export default SeccionForm;
