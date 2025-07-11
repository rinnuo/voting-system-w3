import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Eleccion } from "../../models/eleccion";
import { EleccionService } from "../../services/EleccionService";
import type { Seccion } from "../../models/seccion";
import PageContainer from "../../components/PageContainer";
import Form from "../../components/Form";
import Button from "../../components/Button";

const initialState: Omit<Eleccion, "id"> = {
  nombre: "",
  tipo: "NACIONAL",
  fecha: new Date(),
  activa: false,
  secciones: [],
};

const EleccionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState<Omit<Eleccion, "id">>(initialState);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(!id);

  const [secciones, setSecciones] = useState<Seccion[]>([]);

  useEffect(() => {
    EleccionService.listSecciones()
      .then(setSecciones)
      .catch(() => setError("Error al cargar las secciones"));
  }, []);

  useEffect(() => {
    if (id) {
      setLoading(true);
      EleccionService.getEleccion(Number(id))
        .then((e) => {
          setForm({
            nombre: e.nombre,
            tipo: e.tipo,
            fecha: new Date(e.fecha),
            activa: e.activa,
            secciones: e.secciones,
          });
          setDataLoaded(true);
        })
        .catch(() => setError("No se pudo cargar la elección"))
        .finally(() => setLoading(false));
    } else {
      setForm(initialState);
      setDataLoaded(true);
    }
  }, [id]);

  const handleChange = (updated: Partial<Omit<Eleccion, "id">>) => {
    setForm((prev) => ({ ...prev, ...updated }));
  };

  const handleSubmit = async (data: Omit<Eleccion, "id">) => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (id) {
        await EleccionService.updateEleccion(Number(id), data);
        setSuccess("Elección actualizada correctamente.");
      } else {
        await EleccionService.createEleccion(data);
        setSuccess("Elección creada correctamente.");
      }
      setTimeout(() => navigate("/elecciones/list"), 1000);
    } catch {
      setError("No se pudo guardar la elección.");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: "nombre", label: "Nombre", required: true },
    {
      name: "tipo",
      label: "Tipo",
      type: "select",
      options: [
        { label: "NACIONAL", value: "NACIONAL" },
        { label: "MUNICIPAL", value: "MUNICIPAL" },
        { label: "REGIONAL", value: "REGIONAL" },
      ],
      required: true,
    },
    {
      name: "fecha",
      label: "Fecha",
      type: "date",
      required: true,
    },
    {
      name: "activa",
      label: "Activa",
      type: "checkbox",
    },
    {
      name: "secciones",
      label: "Secciones",
      type: "multiselect",
      options: secciones.map((s) => ({ label: s.nombre, value: s.id })),
      required: true,
    },
  ];

  if (!dataLoaded) {
    return (
      <div className="flex justify-center items-center h-96 text-gray-300">
        Cargando datos de la elección...
      </div>
    );
  }

  return (
    <PageContainer
      title={id ? "Editar Elección" : "Crear Elección"}
      left={
        <Form
          fields={fields}
          values={form}
          onChange={handleChange}
          onSubmit={handleSubmit}
          error={error}
          success={success}
          loading={loading}
          className="max-w-md"
          actions={
            <Button
              type="submit"
              variant="success"
              disabled={loading}
              className="w-full"
            >
              {loading ? "Guardando..." : id ? "Guardar" : "Crear"}
            </Button>
          }
        />
      }
    />
  );
};

export default EleccionForm;
