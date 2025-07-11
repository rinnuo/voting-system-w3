import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Candidatura } from "../../models/candidatura";
import { EleccionService } from "../../services/EleccionService";
import type { Seccion } from "../../models/seccion";
import type { Partido } from "../../models/partido";
import type { Cargo } from "../../models/cargo";
import PageContainer from "../../components/PageContainer";
import Form from "../../components/Form";
import Button from "../../components/Button";

const initialState: Omit<Candidatura, "id"> = {
  nombres: "",
  ci: "",
  foto: null,
  partido: 0,
  cargo: 0,
  secciones: [],
};

const CandidaturaForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(!id);

  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);


  useEffect(() => {
    Promise.all([
      EleccionService.listSecciones(),
      EleccionService.listPartidos(),
      EleccionService.listCargos(),
    ])
      .then(([seccionesRes, partidosRes, cargosRes]) => {
        setSecciones(seccionesRes);
        setPartidos(partidosRes);
        setCargos(cargosRes);
      })
      .catch(() => setError("Error al cargar datos"));
  }, []);

  useEffect(() => {
    if (id) {
      setLoading(true);
      EleccionService.getCandidatura(Number(id))
        .then((c) => {
          setForm({
            nombres: c.nombres,
            ci: c.ci,
            partido: c.partido,
            cargo: c.cargo,
            secciones: c.secciones,
            foto: null,
          });
          setDataLoaded(true);
        })
        .catch(() => setError("No se pudo cargar la candidatura."))
        .finally(() => setLoading(false));
    } else {
      setForm(initialState);
      setDataLoaded(true);
    }
  }, [id]);

  useEffect(() => {
  if (!id && partidos.length > 0 && cargos.length > 0) {
    setForm((prev) => ({
      ...prev,
      partido: partidos[0].id,
      cargo: cargos[0].id,
      secciones: [],
    }));
  }
}, [id, partidos, cargos]);


  const handleChange = (updated: Partial<Candidatura>) => {
    setForm((prev) => ({ ...prev, ...updated }));
  };

  const handleSubmit = async (data: Record<string, any>) => {
  setError(null);
  setSuccess(null);
  setLoading(true);

  try {
    if (id) {
      await EleccionService.updateCandidatura(Number(id), data);
      setSuccess("Candidatura actualizada correctamente.");
    } else {
      await EleccionService.createCandidatura(data);
      setSuccess("Candidatura creada correctamente.");
    }

    setTimeout(() => navigate("/candidaturas/list"), 1000);
  } catch {
    setError("No se pudo guardar la candidatura.");
  } finally {
    setLoading(false);
  }
};


  const fields = [
    { name: "nombres", label: "Nombres", required: true },
    { name: "ci", label: "CI", required: true },
    { name: "foto", label: "Foto", type: "file" },
    {
      name: "partido",
      label: "Partido",
      type: "select",
      options: partidos.map((p) => ({ label: p.nombre, value: p.id })),
      required: true,
    },
    {
      name: "cargo",
      label: "Cargo",
      type: "select",
      options: cargos.map((c) => ({ label: c.nombre, value: c.id })),
      required: true,
    },
    {
      name: "secciones",
      label: "Secciones (ctrl + click para multiples)",
      type: "multiselect",
      options: secciones.map((s) => ({ label: s.nombre, value: s.id })),
      required: true,
    },
  ];

  if (!dataLoaded) {
    return (
      <div className="flex justify-center items-center h-96 text-gray-300">
        Cargando datos de la candidatura...
      </div>
    );
  }

  return (
    <PageContainer
      title={id ? "Editar Candidatura" : "Crear Candidatura"}
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
              {loading ? "Guardando..." : id ? "Guardar" : "Crear"}
            </Button>
          }
          className="max-w-md"
        />
      }
    />
  );
};

export default CandidaturaForm;
