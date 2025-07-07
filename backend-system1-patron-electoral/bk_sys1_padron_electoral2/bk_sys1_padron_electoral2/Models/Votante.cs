namespace bk_sys1_padron_electoral.models
{
    using Microsoft.EntityFrameworkCore;
    using System.ComponentModel.DataAnnotations.Schema;

    [Index(nameof(CI), IsUnique = true)]
    public class Votante
    {
        public Guid Id { get; set; }
        public string CI { get; set; }
        public string NombreCompleto { get; set; }
        public string Direccion { get; set; }
        public double Lat { get; set; }
        public double Lng { get; set; }
        public string FotoCIanverso { get; set; }
        public string FotoCIreverso { get; set; }
        public string FotoVotante { get; set; }

        public int RecintoId { get; set; }
    }

}
