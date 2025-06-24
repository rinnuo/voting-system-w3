

namespace bk_sys1_padron_electoral2.complements
{
    public class GuardarImagenHelper
    {
        public async Task<string> GuardarImagen(IFormFile archivo)
        {
            if (archivo == null || archivo.Length == 0)
                return null;

            var carpeta = Path.Combine("wwwroot", "imagenes");
            Directory.CreateDirectory(carpeta);

            var nombreArchivo = Guid.NewGuid().ToString() + Path.GetExtension(archivo.FileName);
            var ruta = Path.Combine(carpeta, nombreArchivo);

            using (var stream = new FileStream(ruta, FileMode.Create))
            {
                await archivo.CopyToAsync(stream);
            }

            return "/imagenes/" + nombreArchivo;
        }

        public void EliminarImagen(string rutaRelativa)
        {
            if (string.IsNullOrEmpty(rutaRelativa)) return;

            var rutaCompleta = Path.Combine("wwwroot", rutaRelativa.TrimStart('/'));
            if (System.IO.File.Exists(rutaCompleta))
            {
                System.IO.File.Delete(rutaCompleta);
            }
        }
    }

}
