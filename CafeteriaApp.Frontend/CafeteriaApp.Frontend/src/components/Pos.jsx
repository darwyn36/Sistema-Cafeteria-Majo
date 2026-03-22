import React, { useEffect, useState, useRef } from 'react';
import { 
  Layout, Row, Col, Card, Button, Badge, List, 
  Typography, Divider, Space, message, Modal, Empty, theme 
} from 'antd';
import { 
  PlusOutlined, MinusOutlined, ShoppingCartOutlined, 
  DeleteOutlined, PrinterOutlined 
} from '@ant-design/icons';
import { useReactToPrint } from 'react-to-print';
import api from '../api/api';
import Swal from 'sweetalert2';
import { TicketImprimible } from './TicketImprimible';

const { Content } = Layout;
const { Title, Text } = Typography;
const { useToken } = theme;

export default function Pos() {
  const { token } = useToken();
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [ventaReciente, setVentaReciente] = useState(null);
  
  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'Ticket_Venta',
    onAfterPrint: () => setVentaReciente(null),
  });

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = () => {
    api.get('/productos').then(res => setProductos(res.data));
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
    message.success(`${producto.nombre} añadido`);
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

    const datosParaTicket = {
      ...ventaDto,
      detalles: carrito.map(item => ({
        cantidad: item.cantidad,
        precioUnitario: item.precio,
        producto: { nombre: item.nombre } 
      }))
    };

    try {
      // imprimir de pantalla
      const res = await api.post('/ventas', ventaDto);
      const vId = res.data.id || res.data.ventaId || "000";
      setVentaReciente({ ...datosParaTicket, id: vId });
      setTimeout(() => {
        handlePrint();
        Swal.fire({
          title: '¡Venta Exitosa!',
          text: 'Se ha procesado el pago y generado el ticket.',
          icon: 'success',
          confirmButtonColor: token.colorSuccess
        });
      }, 600);

      // Limpiamos la interfaz
      setCarrito([]);
      setIsModalVisible(false);
      cargarProductos();
    } catch (error) {
      console.error("Error al vender:", error.response?.data);
      message.error("No se pudo completar la venta. Revisa la consola.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', background: token.colorBgLayout }}>
      {/* Botón Flotante con Badge de cantidad */}
      <div style={{ position: 'fixed', bottom: 30, right: 30, zIndex: 1000 }}>
        <Badge count={carrito.length} showZero color={token.colorPrimary}>
          <Button 
            type="primary" 
            shape="circle" 
            icon={<ShoppingCartOutlined />} 
            onClick={() => setIsModalVisible(true)}
            style={{ width: 65, height: 65, fontSize: 26, boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}
          />
        </Badge>
      </div>

      <Content style={{ padding: '20px' }}>
        <Row gutter={[16, 16]}>
          {productos.map(p => (
            <Col xs={24} sm={12} md={8} lg={6} xl={4} key={p.id}>
              <Card
                hoverable
                cover={<img alt={p.nombre} src={p.imagenUrl} style={{ height: 160, objectFit: 'cover' }} />}
                actions={[
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={() => agregarAlCarrito(p)}
                    style={{ background: token.colorPrimary, borderColor: token.colorPrimary }}
                  >
                    Agregar
                  </Button>
                ]}
              >
                <Card.Meta 
                  title={p.nombre} 
                  description={<Text strong style={{ color: token.colorPrimary }}>{p.precio.toFixed(2)} Bs</Text>} 
                />
              </Card>
            </Col>
          ))}
        </Row>
      </Content>

      {/* Modal de Pago y Carrito */}
      <Modal
        title={<span><ShoppingCartOutlined style={{ color: token.colorPrimary }} /> Confirmar Pedido</span>}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={450}
      >
        {carrito.length === 0 ? (
          <Empty description="No hay productos en el pedido" />
        ) : (
          <>
            <List
              dataSource={carrito}
              renderItem={item => (
                <List.Item
                  actions={[
                    <Button size="small" shape="circle" icon={<MinusOutlined />} onClick={() => quitarDelCarrito(item.id)} />,
                    <Text strong>{item.cantidad}</Text>,
                    <Button size="small" shape="circle" icon={<PlusOutlined />} onClick={() => agregarAlCarrito(item)} />
                  ]}
                >
                  <List.Item.Meta 
                    title={item.nombre} 
                    description={`${(item.precio * item.cantidad).toFixed(2)} Bs`} 
                  />
                </List.Item>
              )}
            />
            <Divider />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 25 }}>
              <Title level={4} style={{ margin: 0 }}>Total:</Title>
              <Title level={3} style={{ color: token.colorSuccess, margin: 0 }}>{total.toFixed(2)} Bs</Title>
            </div>
            
            <Button 
              type="primary" 
              block 
              size="large" 
              icon={<PrinterOutlined />}
              loading={loading}
              onClick={finalizarVenta}
              style={{ height: 55, fontSize: '1.1rem', background: token.colorSuccess, borderColor: token.colorSuccess }}
            >
              COBRAR E IMPRIMIR
            </Button>
            
            <Button type="text" danger block style={{ marginTop: 15 }} onClick={() => setCarrito([])}>
              Cancelar Pedido
            </Button>
          </>
        )}
      </Modal>

      {/* COMPONENTE OCULTO PARA LA IMPRESIÓN */}
      <div style={{ display: 'none' }}>
        <TicketImprimible ref={componentRef} venta={ventaReciente} />
      </div>
    </Layout>
  );
}