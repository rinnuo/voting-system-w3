using bk_sys1_padron_electoral.models;
using bk_sys1_padron_electoral2.DTOs;
using bk_sys1_padron_electoral2.complements;
using bk_sys1_padron_electoral2.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace bk_sys1_padron_electoral2.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class VotantesController : ControllerBase
    {
        private readonly bk_sys1_padron_electoral2Context _context;
        private readonly IHttpClientFactory _httpClientFactory;

        public VotantesController(
            bk_sys1_padron_electoral2Context context,
            IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _httpClientFactory = httpClientFactory;
        }

        // GET: api/Votantes
        [Authorize(Policy = "EsPadron")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Votante>>> GetVotante()
        {
            return await _context.Votante.ToListAsync();
        }

        // GET: api/Votantes/5
        [Authorize(Policy = "EsPadron")]
        [HttpGet("{id}")]
        public async Task<ActionResult<Votante>> GetVotante(Guid id)
        {
            var votante = await _context.Votante.FindAsync(id);

            if (votante == null)
            {
                return NotFound();
            }

            return votante;
        }

        // PUT: api/Votantes/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [Authorize(Policy = "EsPadron")]
        [HttpPut("{id}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> PutVotante(Guid id, [FromForm] VotanteUpdateDto dto)
        {
            if (!await RecintoExisteAsync(dto.RecintoId))
                return BadRequest("El recinto especificado no existe en el sistema 1.");

            var votante = await _context.Votante.FindAsync(id);
            if (votante == null)
                return NotFound();

            var helper = new GuardarImagenHelper();

            votante.CI = dto.CI;
            votante.NombreCompleto = dto.NombreCompleto;
            votante.Direccion = dto.Direccion;
            votante.RecintoId = dto.RecintoId;

            if (dto.FotoCIanverso != null)
            {
                helper.EliminarImagen(votante.FotoCIanverso);
                votante.FotoCIanverso = await helper.GuardarImagen(dto.FotoCIanverso);
            }

            if (dto.FotoCIreverso != null)
            {
                helper.EliminarImagen(votante.FotoCIreverso);
                votante.FotoCIreverso = await helper.GuardarImagen(dto.FotoCIreverso);
            }

            if (dto.FotoVotante != null)
            {
                helper.EliminarImagen(votante.FotoVotante);
                votante.FotoVotante = await helper.GuardarImagen(dto.FotoVotante);
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // POST: api/Votantes
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [Authorize(Policy = "EsPadron")]
        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<Votante>> PostVotante([FromForm] VotanteUploadDto dto)
        {
            if (!await RecintoExisteAsync(dto.RecintoId))
                return BadRequest("El recinto especificado no existe en el sistema 1.");

            var helper = new GuardarImagenHelper();
            var votante = new Votante
            {
                Id = Guid.NewGuid(),
                CI = dto.CI,
                NombreCompleto = dto.NombreCompleto,
                Direccion = dto.Direccion,
                RecintoId = dto.RecintoId,
                FotoCIanverso = await helper.GuardarImagen(dto.FotoCIanverso),
                FotoCIreverso = await helper.GuardarImagen(dto.FotoCIreverso),
                FotoVotante = await helper.GuardarImagen(dto.FotoVotante)
            };

            _context.Votante.Add(votante);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetVotante), new { id = votante.Id }, votante);
        }

        // DELETE: api/Votantes/5
        [Authorize(Policy = "EsPadron")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVotante(Guid id)
        {
            var votante = await _context.Votante.FindAsync(id);
            if (votante == null)
            {
                return NotFound();
            }
            //eliminar sus imagenes
            var helper = new GuardarImagenHelper();
            helper.EliminarImagen(votante.FotoCIanverso);
            helper.EliminarImagen(votante.FotoCIreverso);
            helper.EliminarImagen(votante.FotoVotante);

            _context.Votante.Remove(votante);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool VotanteExists(Guid id)
        {
            return _context.Votante.Any(e => e.Id == id);
        }

        //METODO PARA DAR LA INFO AL VOTANTE CON SU CI
        [HttpGet("publico/{ci}")]
        public async Task<ActionResult<VotantePublicoDto>> GetVotantePublico(string ci)
        {
            var votante = await _context.Votante.FirstOrDefaultAsync(v => v.CI == ci);
            if (votante == null)
                return NotFound("No se encontró ningún votante con ese CI.");

            // consumir el sistema1 para traer el nombre del recinto
            var client = _httpClientFactory.CreateClient();
            var response = await client.GetAsync("http://127.0.0.1:8002/system2/api/admin/recintos/");
            if (!response.IsSuccessStatusCode)
                return StatusCode(500, "No se pudo verificar el recinto.");

            var json = await response.Content.ReadAsStringAsync();
            var recintos = System.Text.Json.JsonSerializer.Deserialize<List<RecintoDto>>(json);
            var recinto = recintos?.FirstOrDefault(r => r.id == votante.RecintoId);

            return new VotantePublicoDto
            {
                CI = votante.CI,
                NombreCompleto = votante.NombreCompleto,
                RecintoId = votante.RecintoId,
                NombreRecinto = recinto?.nombre ?? "(Recinto no disponible)"
            };
        }

        //Metodos para validar el recinto

        private async Task<bool> RecintoExisteAsync(int recintoId)
        {
            try
            {
                var client = _httpClientFactory.CreateClient();
                var response = await client.GetAsync("http://127.0.0.1:8002/system2/api/admin/recintos/");
                if (!response.IsSuccessStatusCode) return false;

                var json = await response.Content.ReadAsStringAsync();
                var recintos = System.Text.Json.JsonSerializer.Deserialize<List<RecintoDto>>(json);

                return recintos?.Any(r => r.id == recintoId) ?? false;
            }
            catch
            {
                return false;
            }
        }

       
    }

}
