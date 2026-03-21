using Cafeteria.Data.DbContext;
using Cafeteria.Models.Models;
using Cafeteria.Services.Service;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cafeteria.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductosController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ImagenService _imagenService;

        public ProductosController(ApplicationDbContext context, ImagenService imagenService)
        {
            _context = context;
            _imagenService = imagenService;
        }

        // GET: api/Productos
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Producto>>> GetProductos()
        {
            return await _context.Productos
                .Include(p => p.Ingredientes)
                    .ThenInclude(i => i.Insumo) // <-- Esto carga el stock actual en el objeto Producto
                .ToListAsync();
        }

        // Actualizar Profucto
        [HttpPost("upload")]
        public async Task<IActionResult> CrearConImagen([FromForm] string nombre, [FromForm] decimal precio, [FromForm] IFormFile file, [FromForm] string ingredientesJson)
        {
            try
            {
                var urlImagen = await _imagenService.SubirImagen(file);

                var opciones = new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var ingredientes = System.Text.Json.JsonSerializer.Deserialize<List<Receta>>(ingredientesJson, opciones);

                var nuevo = new Producto
                {
                    Nombre = nombre,
                    Precio = precio,
                    ImagenUrl = urlImagen,
                    Ingredientes = ingredientes
                };

                _context.Productos.Add(nuevo);
                await _context.SaveChangesAsync();
                return Ok(nuevo);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error al crear producto: {ex.Message}");
            }
        }

        [HttpDelete("{id}")] // Eliminar Producto
        public async Task<IActionResult> DeleteProducto(int id)
        {
            var producto = await _context.Productos
                .Include(p => p.Ingredientes)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (producto == null) return NotFound();

            try
            {
                _context.Productos.Remove(producto);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest("No se puede eliminar el producto. Verifica si tiene ventas asociadas.");
            }
        }
    }
}