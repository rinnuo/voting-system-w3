import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Votante } from "../../models/votante";
import { PadronService } from "../../services/PadronService";
import List from "../../components/List";
import PageContainer from "../../components/PageContainer";

const VotanteList = () => {
	const [votantes, setVotantes] = useState<Votante[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [deleting, setDeleting] = useState<number | null>(null);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchVotantes = async () => {
			try {
				const data = await PadronService.listVotantes();
				setVotantes(data);
			} catch {
				setError("No se pudieron cargar los votantes.");
			} finally {
				setLoading(false);
			}
		};
		fetchVotantes();
	}, []);

	const handleEdit = (votante: Votante) => {
		navigate(`/votantes/${votante.id}`);
	};

	const handleDelete = async (votante: Votante) => {
		if (!window.confirm("¿Seguro que deseas eliminar este votante?")) return;
		setDeleting(votante.id);
		try {
			await PadronService.deleteVotante(votante.id);
			setVotantes((prev) => prev.filter((v) => v.id !== votante.id));
		} catch {
			alert("No se pudo eliminar el votante.");
		} finally {
			setDeleting(null);
		}
	};

	const columns = [
		{ header: "CI", accessor: "ci" as keyof Votante },
		{ header: "Nombre Completo", accessor: "nombreCompleto" as keyof Votante },
		{ header: "Dirección", accessor: "direccion" as keyof Votante },
		{ header: "Recinto ID", accessor: "recintoId" as keyof Votante },
		{ header: "Foto CI Anverso", accessor: (row: Votante) => row.fotoCIanverso ? <img src={`https://localhost:7265/${row.fotoCIanverso}`} alt="Foto CI Anverso" className="h-32 max-w-full object-contain" /> : "No disponible" },
		{ header: "Foto CI Reverso", accessor: (row: Votante) => row.fotoCIreverso ? <img src={`https://localhost:7265/${row.fotoCIreverso}`} alt="Foto CI Reverso" className="h-32 max-w-full object-contain" /> : "No disponible" },
		{ header: "Foto Votante", accessor: (row: Votante) => row.fotoVotante ? <img src={`https://localhost:7265/${row.fotoVotante}`} alt="Foto Votante" className="h-32 max-w-full object-contain" /> : "No disponible" },
	];

	return (
		<PageContainer
			title="Lista de Votantes"
			left={
				<List
					data={votantes}
					columns={columns}
					loading={loading}
					error={error}
					onEdit={handleEdit}
					onDelete={handleDelete}
					deleteLabel={deleting ? "Eliminando..." : "Eliminar"}
					emptyMessage="No hay votantes."
				/>
			}
		/>
	);
};

export default VotanteList;