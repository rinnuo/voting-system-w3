namespace bk_sys1_padron_electoral2.DTOs
{
    public class VotanteUploadDto
    {
        public string CI { get; set; }
        public string NombreCompleto { get; set; }
        public string Direccion { get; set; }
        public int RecintoId { get; set; }

        public IFormFile FotoCIanverso { get; set; }
        public IFormFile FotoCIreverso { get; set; }
        public IFormFile FotoVotante { get; set; }
    }
}
