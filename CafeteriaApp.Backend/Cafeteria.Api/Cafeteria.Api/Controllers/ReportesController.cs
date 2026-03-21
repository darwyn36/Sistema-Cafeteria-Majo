using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Cafeteria.Data.DbContext;

namespace Cafeteria.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ReportesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("resumen-diario")]
        public async Task<IActionResult> GetResumenDiario()
        {
            var hoy = DateTime.Today;

            var totalVentas = await _context.Ventas
                .Where(v => v.Fecha.Date == hoy)
                .SumAsync(v => v.Total);

            var topProductos = await _context.DetallesVentas
                .Where(d => d.Venta.Fecha.Date == hoy)
                .GroupBy(d => d.Producto.Nombre)
                .Select(g => new { 
                    Producto = g.Key, 
                    Cantidad = g.Sum(x => x.Cantidad) 
                })
                .OrderByDescending(x => x.Cantidad)
                .Take(3)
                .ToListAsync();

            var stockBajo = await _context.Insumos
                .Where(i => i.StockActual <= i.StockMinimo)
                .Select(i => new { i.Nombre, i.StockActual })
                .ToListAsync();

            return Ok(new {
                fecha = hoy.ToShortDateString(),
                totalDinero = totalVentas,
                productosMasVendidos = topProductos,
                alertasInventario = stockBajo
            });
        }
    }
}