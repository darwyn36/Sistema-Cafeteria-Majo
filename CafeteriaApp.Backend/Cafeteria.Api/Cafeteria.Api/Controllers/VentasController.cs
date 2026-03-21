using Cafeteria.Data.DbContext;
using Cafeteria.Models.Models;
using Cafeteria.Services.Service;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cafeteria.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VentasController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly InventarioService _inventario;

        public VentasController(ApplicationDbContext context, InventarioService inventario)
        {
            _context = context;
            _inventario = inventario;
        }

        [HttpPost]
        public async Task<ActionResult<Venta>> CrearVenta(Venta venta)
        {
            // Usamos una transacción para que si falla el stock, no se guarde la venta
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                _context.Ventas.Add(venta);
                await _context.SaveChangesAsync();

                if (venta.Detalles != null && venta.Detalles.Any())
                {
                    foreach (var detalle in venta.Detalles)
                    {
                        await _inventario.DescontarStock(detalle.ProductoId, detalle.Cantidad);
                    }
                }
                else
                {
                    return BadRequest("La venta no contiene productos.");
                }

                await transaction.CommitAsync();

                return Ok(new
                {
                    message = "Venta realizada y stock actualizado con éxito",
                    ventaId = venta.Id
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"Error crítico al procesar la venta: {ex.Message}");
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Venta>>> GetVentas()
        {
            // Incluimos los detalles y el nombre del producto para que el reporte sea legible (PDF)
            var ventas = await _context.Ventas
                .Include(v => v.Detalles)
                    .ThenInclude(d => d.Producto)
                .OrderByDescending(v => v.Fecha)
                .ToListAsync();

            return Ok(ventas);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Venta>> GetVenta(int id)
        {
            var venta = await _context.Ventas
                .Include(v => v.Detalles)
                    .ThenInclude(d => d.Producto)
                .FirstOrDefaultAsync(v => v.Id == id);

            if (venta == null) return NotFound();

            return Ok(venta);
        }
    }
}