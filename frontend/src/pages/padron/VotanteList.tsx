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
		{ header: "ID", accessor: "id" as keyof Votante },
		{ header: "CI", accessor: "ci" as keyof Votante },
		{ header: "Nombre Completo", accessor: "nombreCompleto" as keyof Votante },
		{ header: "Dirección", accessor: "direccion" as keyof Votante },
		{ header: "Recinto ID", accessor: "recintoId" as keyof Votante },
		{ header: "Foto CI Anverso", accessor: "fotoCIanverso" as keyof Votante, render: (votante: Votante) => votante.fotoCIanverso ? <img src={URL.createObjectURL(votante.fotoCIanverso)} alt="Foto CI Anverso" className="w-16 h-16 object-cover" /> : "No disponible" },
		{ header: "Foto CI Reverso", accessor: "fotoCIreverso" as keyof Votante, render: (votante: Votante) => votante.fotoCIreverso ? <img src={URL.createObjectURL(votante.fotoCIreverso)} alt="Foto CI Reverso" className="w-16 h-16 object-cover" /> : "No disponible" },
		{ header: "Foto Votante", accessor: "fotoVotante" as keyof Votante, render: (votante: Votante) => votante.fotoVotante ? <img src={URL.createObjectURL(votante.fotoVotante)} alt="Foto Votante" className="w-16 h-16 object-cover" /> : "No disponible" },
		
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