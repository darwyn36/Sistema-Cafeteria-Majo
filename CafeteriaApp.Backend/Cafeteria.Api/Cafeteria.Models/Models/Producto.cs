
namespace Cafeteria.Models.Models
{
    public class Producto
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public decimal Precio { get; set; }
        public string ImagenUrl { get; set; }
        public List<Receta> Ingredientes { get; set; } = new List<Receta>();
    }
}
