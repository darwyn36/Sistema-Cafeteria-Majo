using System;
using System.Collections.Generic;
using System.Text;

namespace Cafeteria.Models.Models
{
    public class Insumo
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public decimal StockActual { get; set; }
        public decimal StockMinimo { get; set; }
        public string UnidadMedida { get; set; }
    }
}
