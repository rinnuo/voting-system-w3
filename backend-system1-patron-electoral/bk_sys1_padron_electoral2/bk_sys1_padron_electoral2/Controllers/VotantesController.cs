using bk_sys1_padron_electoral.models;
using bk_sys1_padron_electoral2.complements;
using bk_sys1_padron_electoral2.Data;
using bk_sys1_padron_electoral2.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Text;
using System.Text.Json;
using System.Net.Http;
using System.Net.Http.Headers;


namespace bk_sys1_padron_electoral2.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class VotantesController : ControllerBase
    {
        private readonly bk_sys1_padron_electoral2Context _context;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<VotantesController> _logger;

        public VotantesController(
            bk_sys1_padron_electoral2Context context,
            IHttpClientFactory httpClientFactory,
            ILogger<VotantesController> logger)
        {
            _context = context;
            _httpClientFactory = httpClientFactory;
            _logger = logger;
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
            var votante = await _context.Votante.FindAsync(id);
            if (votante == null)
                return NotFound();

            var helper = new GuardarImagenHelper();

            votante.CI = dto.CI;
            votante.NombreCompleto = dto.NombreCompleto;
            votante.Direccion = dto.Direccion;
            //votante.RecintoId = dto.RecintoId;
            votante.Lat = dto.Lat;
            votante.Lng = dto.Lng;

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
            //notificar al sistema 2 que se ha actualizado un votante
            //await RegistrarVotanteEnSistema2Async(id, votante.Lat, votante.Lng, votante.RecintoId);

            try
            {
                await RegistrarVotanteEnSistema2Async(
                    votante.Id,
                    votante.Lat,
                    votante.Lng,
                    votante.RecintoId
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Fallo al notificar Sistema2 para votante {VotanteId}", votante.Id);
                // devolvemos 502 Bad Gateway para indicar problema al conectar con el servicio externo
                return StatusCode(502, new { detail = "Votante actualizado, pero falló la notificación al sistema electoral, verifique si la seccion seleccionada es correcta" });
            }


            return NoContent();
        }

        // POST: api/Votantes
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [Authorize(Policy = "EsPadron")]
        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<Votante>> PostVotante([FromForm] VotanteUploadDto dto)
        {

            var helper = new GuardarImagenHelper();
            var votante = new Votante
            {
                Id = Guid.NewGuid(),
                CI = dto.CI,
                NombreCompleto = dto.NombreCompleto,
                Direccion = dto.Direccion,
                //RecintoId = dto.RecintoId,
                Lat = dto.Lat,
                Lng = dto.Lng,
                FotoCIanverso = await helper.GuardarImagen(dto.FotoCIanverso),
                FotoCIreverso = await helper.GuardarImagen(dto.FotoCIreverso),
                FotoVotante = await helper.GuardarImagen(dto.FotoVotante)
            };

            _context.Votante.Add(votante);
            await _context.SaveChangesAsync();

            //notificar al sistema 2 que se ha registrado un votante
            try
            {
                await RegistrarVotanteEnSistema2Async(
                    votante.Id,
                    votante.Lat,
                    votante.Lng,
                    votante.RecintoId
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Fallo al notificar Sistema2 para votante {VotanteId}", votante.Id);
                // devolvemos 502 Bad Gateway para indicar problema al conectar con el servicio externo
                return StatusCode(502, new { detail = "Votante actualizado, pero falló la notificación al sistema electoral, verifique si la seccion seleccionada es correcta" });
            }
           
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
            // 1) Busco al votante en mi BD
            var votante = await _context.Votante
                .AsNoTracking()
                .FirstOrDefaultAsync(v => v.CI == ci);

            if (votante == null)
                return NotFound("No se encontró ningún votante con ese CI.");

            // 2) Llamo a Sistema 2 para obtener sección, recinto y mesa
            var client = _httpClientFactory.CreateClient();
            var partResponse = await client
                .GetAsync($"http://127.0.0.1:8002/system2/api/admin/participaciones/{votante.Id}");

            if (!partResponse.IsSuccessStatusCode)
                return StatusCode(502, "No se pudo obtener la asignación de mesa.");

            var partJson = await partResponse.Content.ReadAsStringAsync();
            var partDto = JsonSerializer.Deserialize<ParticipacionDto>(partJson, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (partDto == null)
                return StatusCode(502, "Respuesta inválida de asignación de mesa.");


            // 4) Armar DTO de salida
            var salida = new VotantePublicoDto
            {
                CI = votante.CI,
                NombreCompleto = votante.NombreCompleto,
                RecintoId = partDto.RecintoId,
                NombreRecinto = partDto.RecintoNombre,  // vienes directo del API
                MesaNumero = partDto.MesaNumero
            };

            return Ok(salida);
        }

     

        //METODO PARA REGISTRAR UN VOTANTE EN EL SISTEMA 2:
        private async Task RegistrarVotanteEnSistema2Async(
            Guid votanteId,
            double lat,
            double lng,
            int recintoId
        )
        {
            var client = _httpClientFactory.CreateClient();

            var payload = new
            {
                votante_id = votanteId,
                lat = lat,
                lng = lng,
                recinto_id = recintoId
            };

            // 1) Serializar a JSON
            var json = JsonSerializer.Serialize(payload);

            // 2) Crear StringContent y fijar Content-Length
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            content.Headers.ContentLength = Encoding.UTF8.GetByteCount(json);

            // 3) Hacer el POST (ya no chunked)
            var url = "http://127.0.0.1:8002/system2/api/admin/registrar_votante/registrar_votante/";
            var response = await client.PostAsync(url, content);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                throw new Exception($"Error registrando votante en Sistema 2: {error}");
            }

        }
    }
}
