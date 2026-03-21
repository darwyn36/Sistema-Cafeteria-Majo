import React, { useEffect, useState } from 'react';
import { 
  Layout, Row, Col, Card, Button, Badge, List, 
  Typography, Divider, Space, message, Modal, Empty 
} from 'antd';
import { 
  PlusOutlined, MinusOutlined, ShoppingCartOutlined, 
  DeleteOutlined, CoffeeOutlined, PrinterOutlined 
} from '@ant-design/icons';
import api from '../api/api';
import Swal from 'sweetalert2';

// ESTAS DOS SON VITALES PARA EL PDF

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

export default function Pos() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = () => {
    api.get('/productos').then(res => setProductos(res.data));
  };

  // --- PREVISUALIZACIÓN DEL TICKET ---
  const verImprimirTicket = (ventaId, detalleCarrito, totalVenta) => {
    try {
      const doc = new jsPDF({ unit: 'mm', format: [80, 150] });
      doc.setFontSize(14);
      doc.text("☕ COFFEE SHOP", 40, 10, { align: 'center' });
      doc.setFontSize(8);
      doc.text(`Ticket: #${ventaId || '000'}`, 10, 20);
      doc.text(`Fecha: ${new Date().toLocaleString()}`, 10, 25);

      const filas = detalleCarrito.map(item => [
        item.cantidad,
        item.nombre.substring(0, 15),
        `$${(item.precio * item.cantidad).toFixed(2)}`
      ]);

      doc.autoTable({
        startY: 30,
        head: [["Cant", "Prod", "Subt"]],
        body: filas,
        theme: 'plain',
        styles: { fontSize: 7 },
      });

      const finalY = doc.lastAutoTable.finalY + 5;
      doc.setFontSize(10);
      doc.text(`TOTAL: $${totalVenta.toFixed(2)}`, 70, finalY, { align: 'right' });

      // Abrir en pestaña nueva para previsualizar
      const blobURL = doc.output('bloburl');
      window.open(blobURL, '_blank');
    } catch (err) {
      message.error("Error al generar vista previa del ticket");
    }
  };

  const agregarAlCarrito = (producto) => {
    const existe = carrito.find(item => item.id === producto.id);
    if (existe) {
      setCarrito(carrito.map(item => 
        item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
      ));
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
    }
    message.success(`${producto.nombre} agregado`);
  };

  const quitarDelCarrito = (id) => {
    const item = carrito.find(i => i.id === id);
    if (item.cantidad > 1) {
      setCarrito(carrito.map(i => i.id === id ? { ...i, cantidad: i.cantidad - 1 } : i));
    } else {
      setCarrito(carrito.filter(i => i.id !== id));
    }
  };

  const total = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

  const finalizarVenta = async () => {
    if (carrito.length === 0) return;
    setLoading(true);

    const ventaDto = {
      fecha: new Date().toISOString(),
      total: total,
      detalles: carrito.map(item => ({
        productoId: item.id,
        cantidad: item.cantidad,
        precioUnitario: item.precio
      }))
    };

    try {
      const res = await api.post('/ventas', ventaDto);
      const vId = res.data.ventaId || res.data.id;

      verImprimirTicket(vId, carrito, total);

      Swal.fire({
        title: '¡Venta Exitosa!',
        text: 'Stock actualizado y ticket generado.',
        icon: 'success',
        confirmButtonColor: '#52c41a'
      });

      setCarrito([]);
      cargarProductos();
    } catch (error) {
      message.error("No se pudo procesar la venta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Header style={{ background: '#4b3832', display: 'flex', alignItems: 'center', padding: '0 20px' }}>
        <Title level={3} style={{ color: 'white', margin: 0 }}>
          <CoffeeOutlined />Cafetería Majo
        </Title>
      </Header>

      <Layout>
        <Content style={{ padding: '20px' }}>
          <Row gutter={[16, 16]}>
            {productos.map(p => (
              <Col xs={24} sm={12} md={8} lg={6} key={p.id}>
                <Card
                  hoverable
                  cover={<img alt={p.nombre} src={p.imagenUrl} style={{ height: 160, objectFit: 'cover' }} />}
                  actions={[
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />} 
                      onClick={() => agregarAlCarrito(p)}
                      style={{ backgroundColor: '#6f4e37', borderColor: '#6f4e37' }}
                    >
                      Agregar
                    </Button>
                  ]}
                >
                  <Card.Meta 
                    title={p.nombre} 
                    description={<Text strong style={{ color: '#6f4e37', fontSize: '1.2em' }}>${p.precio.toFixed(2)}</Text>} 
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </Content>

        <Sider width={400} theme="light" style={{ padding: '20px', borderLeft: '1px solid #ddd' }}>
          <Title level={4}><ShoppingCartOutlined /> Ticket Actual</Title>
          <Divider />
          
          <div style={{ minHeight: 'calc(100vh - 350px)', overflowY: 'auto' }}>
            {carrito.length === 0 ? (
              <Empty description="El carrito está vacío" />
            ) : (
              <List
                itemLayout="horizontal"
                dataSource={carrito}
                renderItem={item => (
                  <List.Item
                    actions={[
                      <Button size="small" icon={<MinusOutlined />} onClick={() => quitarDelCarrito(item.id)} />,
                      <Text strong>{item.cantidad}</Text>,
                      <Button size="small" icon={<PlusOutlined />} onClick={() => agregarAlCarrito(item)} />
                    ]}
                  >
                    <List.Item.Meta
                      title={item.nombre}
                      description={`$${(item.precio * item.cantidad).toFixed(2)}`}
                    />
                  </List.Item>
                )}
              />
            )}
          </div>

          <Divider />
          
          <div style={{ padding: '10px 0' }}>
            <Row justify="space-between">
              <Col><Title level={3}>Total:</Title></Col>
              <Col><Title level={3} style={{ color: '#52c41a' }}>${total.toFixed(2)}</Title></Col>
            </Row>
            
            <Button 
              type="primary" 
              block 
              size="large" 
              icon={<PrinterOutlined />}
              loading={loading}
              disabled={carrito.length === 0}
              onClick={finalizarVenta}
              style={{ height: '60px', fontSize: '1.2em', marginTop: '10px', background: '#52c41a', borderColor: '#52c41a' }}
            >
              COBRAR E IMPRIMIR
            </Button>
            
            <Button 
              block 
              danger 
              icon={<DeleteOutlined />} 
              style={{ marginTop: '10px' }}
              onClick={() => setCarrito([])}
              disabled={carrito.length === 0}
            >
              Cancelar Pedido
            </Button>
          </div>
        </Sider>
      </Layout>
    </Layout>
  );
}