import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Mesa } from "../../models/mesa";
import { EleccionService } from "../../services/EleccionService";
import type { Eleccion } from "../../models/eleccion";
import type { Recinto } from "../../models/recinto";
import PageContainer from "../../components/PageContainer";
import Form from "../../components/Form";
import Button from "../../components/Button";

const initialState: Omit<Mesa, "id" | "recinto_nombre"> = {
  numero: 0,
  eleccion: 0,
  recinto: 0,
};

const MesaForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(!id);

  const [elecciones, setElecciones] = useState<Eleccion[]>([]);
  const [recintos, setRecintos] = useState<Recinto[]>([]);

  useEffect(() => {
    Promise.all([
      EleccionService.listElecciones(),
      EleccionService.listRecintos(),
    ])
      .then(([eleccionesRes, recintosRes]) => {
        setElecciones(eleccionesRes);
        setRecintos(recintosRes);
      })
      .catch(() => setError("Error al cargar datos"));
  }, []);

  useEffect(() => {
    if (id) {
      setLoading(true);
      EleccionService.getMesa(Number(id))
        .then((mesa) => {
          setForm({
            numero: mesa.numero,
            eleccion: mesa.eleccion,
            recinto: mesa.recinto,
          });
          setDataLoaded(true);
        })
        .catch(() => setError("No se pudo cargar la mesa."))
        .finally(() => setLoading(false));
    } else {
      setForm(initialState);
      setDataLoaded(true);
    }
  }, [id]);

  useEffect(() => {
    if (elecciones.length > 0 && recintos.length > 0 && !id) {
      setForm({
        numero: 0,
        eleccion: elecciones[0].id,
        recinto: recintos[0].id,
      });
    }
  }, [elecciones, recintos, id]);


  const handleChange = (updated: Partial<Mesa>) => {
    setForm((prev) => ({ ...prev, ...updated }));
  };

  const handleSubmit = async (data: Record<string, any>) => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("numero", String(data.numero));
    formData.append("eleccion", String(data.eleccion));
    formData.append("recinto", String(data.recinto));

    try {
      if (id) {
        await EleccionService.updateMesa(Number(id), formData);
        setSuccess("Mesa actualizada correctamente.");
      } else {
        await EleccionService.createMesa(formData);
        setSuccess("Mesa creada correctamente.");
      }
      setTimeout(() => navigate("/mesas/list"), 1000);
    } catch {
      setError("No se pudo guardar la mesa.");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: "numero", label: "Número de Mesa", type: "number", required: true },
    {
      name: "eleccion",
      label: "Elección",
      type: "select",
      options: elecciones.map((e) => ({ label: e.nombre, value: e.id })),
      required: true,
    },
    {
      name: "recinto",
      label: "Recinto",
      type: "select",
      options: recintos.map((r) => ({ label: r.nombre, value: r.id })),
      required: true,
    },
  ];

  if (!dataLoaded) {
    return (
      <div className="flex justify-center items-center h-96 text-gray-300">
        Cargando datos de la mesa...
      </div>
    );
  }

  return (
    <PageContainer
      title={id ? "Editar Mesa" : "Crear Mesa"}
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

export default MesaForm;
