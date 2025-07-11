import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Cargo } from "../../models/cargo";
import { EleccionService } from "../../services/EleccionService";
import type { Seccion } from "../../models/seccion";
import type { Eleccion } from "../../models/eleccion"; // If you have this model for elections
import PageContainer from "../../components/PageContainer";
import Form from "../../components/Form";
import Button from "../../components/Button";

const initialState: Omit<Cargo, "id" | "eleccion_nombre"> = {
  nombre: "",
  descripcion: "",
  eleccion: 0,
  secciones: [],
};

const CargoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(!id);

  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [elecciones, setElecciones] = useState<Eleccion[]>([]);

  useEffect(() => {
    Promise.all([
      EleccionService.listSecciones(),
      EleccionService.listElecciones(),
    ])
      .then(([seccionesRes, eleccionesRes]) => {
        setSecciones(seccionesRes);
        setElecciones(eleccionesRes);
      })
      .catch(() => setError("Error al cargar datos"));
  }, []);

  useEffect(() => {
    if (id) {
      setLoading(true);
      EleccionService.getCargo(Number(id))
        .then((cargo) => {
          setForm({
            nombre: cargo.nombre,
            descripcion: cargo.descripcion,
            eleccion: cargo.eleccion,
            secciones: cargo.secciones,
          });
          setDataLoaded(true);
        })
        .catch(() => setError("No se pudo cargar el cargo."))
        .finally(() => setLoading(false));
    } else {
      setForm(initialState);
      setDataLoaded(true);
    }
  }, [id]);

  const handleChange = (updated: Partial<Cargo>) => {
    setForm((prev) => ({ ...prev, ...updated }));
  };

  const handleSubmit = async (data: Record<string, any>) => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("nombre", data.nombre);
    formData.append("descripcion", data.descripcion);
    formData.append("eleccion", String(data.eleccion));
    data.secciones.forEach((s: number) => formData.append("secciones", String(s)));

    try {
      if (id) {
        await EleccionService.updateCargo(Number(id), formData);
        setSuccess("Cargo actualizado correctamente.");
      } else {
        await EleccionService.createCargo(formData);
        setSuccess("Cargo creado correctamente.");
      }
      setTimeout(() => navigate("/cargos/list"), 1000);
    } catch {
      setError("No se pudo guardar el cargo.");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: "nombre", label: "Nombre", required: true },
    { name: "descripcion", label: "Descripción", type: "textarea", required: true },
    {
      name: "eleccion",
      label: "Elección",
      type: "select",
      options: elecciones.map((e) => ({ label: e.nombre, value: e.id })),
      required: true,
    },
    {
      name: "secciones",
      label: "Secciones (ctrl + click para múltiples)",
      type: "multiselect",
      options: secciones.map((s) => ({ label: s.nombre, value: s.id })),
      required: true,
    },
  ];

  if (!dataLoaded) {
    return (
      <div className="flex justify-center items-center h-96 text-gray-300">
        Cargando datos del cargo...
      </div>
    );
  }

  return (
    <PageContainer
      title={id ? "Editar Cargo" : "Crear Cargo"}
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

export default CargoForm;
