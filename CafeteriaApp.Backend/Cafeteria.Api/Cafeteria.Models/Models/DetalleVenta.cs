using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json.Serialization;

namespace Cafeteria.Models.Models
{
    public class DetalleVenta
    {
        public int Id { get; set; }
        public int VentaId { get; set; }
        public int ProductoId { get; set; }
        public Producto? Producto { get; set; }
        public int Cantidad { get; set; }
        public decimal PrecioUnitario { get; set; }
        [JsonIgnore]
        public Venta? Venta { get; set; }
        public decimal Subtotal => Cantidad * PrecioUnitario;
    }
}
