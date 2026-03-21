using System;
using System.Collections.Generic;
using System.Text;

namespace Cafeteria.Models.Models
{
    public class Venta
    {
        public int Id { get; set; }
        public DateTime Fecha { get; set; } = DateTime.Now;
        public decimal Total { get; set; }
        public List<DetalleVenta>? Detalles { get; set; }
    }
}
