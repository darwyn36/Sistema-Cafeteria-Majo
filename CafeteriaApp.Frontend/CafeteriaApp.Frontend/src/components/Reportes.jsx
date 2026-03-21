import React, { useEffect, useState, useRef } from 'react';
import { 
  Table, Card, Row, Col, Typography, 
  Statistic, Button, Space, Tag, Empty, Spin, message 
} from 'antd';
import { 
  BarChartOutlined, 
  DollarCircleOutlined, 
  ShoppingOutlined, 
  PrinterOutlined,
  ArrowUpOutlined 
} from '@ant-design/icons';
import { useReactToPrint } from 'react-to-print';
import api from '../api/api';
import { TicketImprimible } from './TicketImprimible';

const { Title, Text } = Typography;

export default function Reportes() {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ventaAImprimir, setVentaAImprimir] = useState(null);
  
  // Referencia para el componente de impresión
  const componentRef = useRef();

  useEffect(() => {
    cargarVentas();
  }, []);

  const cargarVentas = () => {
    api.get('/ventas')
      .then(res => {
        setVentas(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        message.error("Error al cargar las ventas");
        setLoading(false);
      });
  };

  // --- CONFIGURACIÓN DE REACT-TO-PRINT (Imprimir) ---
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Ticket_${ventaAImprimir?.id}`,
    onAfterPrint: () => setVentaAImprimir(null), // Limpiamos la selección después de imprimir
  });

  const prepararImpresion = (venta) => {
    if (!venta.detalles || venta.detalles.length === 0) {
      return message.warning("Esta venta no tiene detalles para imprimir");
    }
    setVentaAImprimir(venta);
    // Ejecutamos la impresión con un pequeño delay para que el componente renderice los datos
    setTimeout(() => {
      handlePrint();
    }, 300);
  };

  // Cálculos rápidos
  const totalHistorico = ventas.reduce((acc, v) => acc + v.total, 0);
  const promedioVenta = ventas.length > 0 ? totalHistorico / ventas.length : 0;

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <Text strong>#{id}</Text>,
    },
    {
      title: 'Fecha y Hora',
      dataIndex: 'fecha',
      key: 'fecha',
      render: (fecha) => new Date(fecha).toLocaleString(),
      sorter: (a, b) => new Date(a.fecha) - new Date(b.fecha),
    },
    {
      title: 'Detalle de Productos',
      dataIndex: 'detalles',
      key: 'detalles',
      render: (detalles) => (
        <Space direction="vertical" size="small">
          {detalles?.map((d, index) => (
            <Tag color="blue" key={index}>
              {d.cantidad}x {d.producto?.nombre || 'Producto'}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Total Pago',
      dataIndex: 'total',
      key: 'total',
      render: (total) => (
        <Text type="success" strong style={{ fontSize: '1.1em' }}>
          ${total.toFixed(2)}
        </Text>
      ),
      sorter: (a, b) => a.total - b.total,
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_, record) => (
        <Button 
          type="default" 
          icon={<PrinterOutlined />} 
          onClick={() => prepararImpresion(record)}
        >
          Imprimir Ticket
        </Button>
      ),
    },
  ];

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '100px' }}>
      <Spin size="large" tip="Cargando análisis..." />
    </div>
  );

  return (
    <div style={{ padding: '30px', background: '#fdfaf6', minHeight: '100vh' }}>
      <Title level={2} style={{ color: '#4b3832' }}>
        <BarChartOutlined /> Análisis de Negocio
      </Title>

      <Row gutter={[16, 16]} style={{ marginBottom: '30px' }}>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderLeft: '5px solid #27ae60' }}>
            <Statistic
              title="Ingresos Totales"
              value={totalHistorico}
              precision={2}
              valueStyle={{ color: '#3f8600' }}
              prefix={<DollarCircleOutlined />}
              suffix="$"
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderLeft: '5px solid #2980b9' }}>
            <Statistic title="Total Ventas" value={ventas.length} prefix={<ShoppingOutlined />} valueStyle={{ color: '#1677ff' }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderLeft: '5px solid #f39c12' }}>
            <Statistic title="Ticket Promedio" value={promedioVenta} precision={2} valueStyle={{ color: '#cf1322' }} prefix={<ArrowUpOutlined />} suffix="$" />
          </Card>
        </Col>
      </Row>

      <Card title="Historial de Ventas" bordered={false} style={{ borderRadius: '15px' }}>
        <Table columns={columns} dataSource={ventas} rowKey="id" pagination={{ pageSize: 10 }} />
      </Card>

      <div style={{ display: 'none' }}>
        <TicketImprimible ref={componentRef} venta={ventaAImprimir} />
      </div>
    </div>
  );
}