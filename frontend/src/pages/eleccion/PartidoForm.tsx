import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Partido } from "../../models/partido";
import { EleccionService } from "../../services/EleccionService";
import PageContainer from "../../components/PageContainer";
import Form from "../../components/Form";
import Button from "../../components/Button";

const initialState: Omit<Partido, "id"> = {
  nombre: "",
  sigla: "",
  color: "#000000",
};

const PartidoForm = () => {
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
      EleccionService.getPartido(Number(id))
        .then((partido) => {
          setForm({
            nombre: partido.nombre,
            sigla: partido.sigla,
            color: partido.color,
          });
          setDataLoaded(true);
        })
        .catch(() => setError("No se pudo cargar el partido."))
        .finally(() => setLoading(false));
    } else {
      setForm(initialState);
      setDataLoaded(true);
    }
  }, [id]);

  const handleChange = (updated: Partial<Partido>) => {
    setForm((prev) => ({ ...prev, ...updated }));
  };

  const handleSubmit = async (data: Record<string, any>) => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("nombre", data.nombre);
    formData.append("sigla", data.sigla);
    formData.append("color", data.color);

    try {
      if (id) {
        await EleccionService.updatePartido(Number(id), formData);
        setSuccess("Partido actualizado correctamente.");
      } else {
        await EleccionService.createPartido(formData);
        setSuccess("Partido creado correctamente.");
      }
      setTimeout(() => navigate("/partidos/list"), 1000);
    } catch {
      setError("No se pudo guardar el partido.");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: "nombre", label: "Nombre del Partido", required: true },
    { name: "sigla", label: "Sigla", required: true },
    {
      name: "color",
      label: "Color Representativo",
      type: "color",
      required: true,
    },
  ];

  if (!dataLoaded) {
    return (
      <div className="flex justify-center items-center h-96 text-gray-300">
        Cargando datos del partido...
      </div>
    );
  }

  return (
    <PageContainer
      title={id ? "Editar Partido" : "Crear Partido"}
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
            <Button type="submit" variant="success" disabled={loading} className="w-full">
              {loading ? "Guardando..." : id ? "Guardar" : "Crear"}
            </Button>
          }
          className="max-w-md"
        />
      }
    />
  );
};

export default PartidoForm;
