using System;
using System.Collections.Generic;
using System.Text;

namespace Cafeteria.Models.Models
{
    public class Receta
    {
        public int Id { get; set; }
        public int ProductoId { get; set; }
        public int InsumoId { get; set; }
        public Insumo? Insumo { get; set; }
        public decimal CantidadRequerida { get; set; }
    }
}
