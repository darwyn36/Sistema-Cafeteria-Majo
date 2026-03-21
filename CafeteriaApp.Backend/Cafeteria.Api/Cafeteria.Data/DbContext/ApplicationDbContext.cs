using Cafeteria.Models.Models;
using Microsoft.EntityFrameworkCore;

namespace Cafeteria.Data.DbContext
{
    public class ApplicationDbContext : Microsoft.EntityFrameworkCore.DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<Producto> Productos { get; set; }
        public DbSet<Insumo> Insumos { get; set; }
        public DbSet<Receta> Recetas { get; set; }
        public DbSet<Venta> Ventas { get; set; }
        public DbSet<DetalleVenta> DetallesVentas { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Producto>()
                .Property(p => p.Precio)
                .HasColumnType("decimal(18,2)");
            modelBuilder.Entity<Insumo>()
                .Property(i => i.StockActual)
                .HasColumnType("decimal(18,2)");
            modelBuilder.Entity<Insumo>()
                .Property(i => i.StockMinimo)
                .HasColumnType("decimal(18,2)");
            modelBuilder.Entity<Receta>()
                .Property(r => r.CantidadRequerida)
                .HasColumnType("decimal(18,2)");
            modelBuilder.Entity<Venta>()
                .Property(v => v.Total)
                .HasColumnType("decimal(18,2)");
            modelBuilder.Entity<DetalleVenta>()
                .Property(d => d.PrecioUnitario)
                .HasColumnType("decimal(18,2)");

            base.OnModelCreating(modelBuilder);
        }
    }
}
