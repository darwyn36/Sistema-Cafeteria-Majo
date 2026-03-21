using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Cafeteria.Data.DbContext;
using Cafeteria.Models.Models;

namespace Cafeteria.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InsumosController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public InsumosController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Insumo>>> GetInsumos()
        {
            return await _context.Insumos.ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Insumo>> PostInsumo(Insumo nuevoInsumo)
        {
            _context.Insumos.Add(nuevoInsumo);
            await _context.SaveChangesAsync();
            return Ok(nuevoInsumo);
        }

        // --- ESTE ES EL MÉTODO QUE TE FALTABA ---
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteInsumo(int id)
        {
            // Buscamos si el insumo existe en la base de datos
            var insumo = await _context.Insumos.FindAsync(id);

            if (insumo == null) return NotFound();

            try
            {
                _context.Insumos.Remove(insumo);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception)
            {
                return BadRequest("No se puede eliminar el insumo porque está asociado a un producto.");
            }
        }
    }
}