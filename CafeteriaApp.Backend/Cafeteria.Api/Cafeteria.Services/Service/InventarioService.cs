using Cafeteria.Data.DbContext;
using Microsoft.EntityFrameworkCore;

namespace Cafeteria.Services.Service
{
    public class InventarioService
    {
        private readonly ApplicationDbContext _context;

        public InventarioService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task DescontarStock(int productoId, int cantidadVendida)
        {
            // Forzamos la búsqueda de la receta directamente en la tabla Recetas
            var recetaItems = await _context.Recetas
                .Where(r => r.ProductoId == productoId)
                .ToListAsync();

            // significa que el producto NO tiene ingredientes en la BD.
            if (recetaItems.Count == 0)
            {
                System.Diagnostics.Debug.WriteLine($"ALERTA: El producto {productoId} no tiene receta registrada.");
                return;
            }

            foreach (var item in recetaItems)
            {
                var insumo = await _context.Insumos.FindAsync(item.InsumoId);
                if (insumo != null)
                {
                    // Restamos la cantidad requerida por cada unidad vendida
                    insumo.StockActual -= (item.CantidadRequerida * (decimal)cantidadVendida);

                    // Avisamos a Entity Framework que este insumo cambió
                    _context.Entry(insumo).State = EntityState.Modified;
                }
            }
            await _context.SaveChangesAsync();
        }
    }
}
