import React, { useEffect, useState, useRef } from 'react';
import { 
  Table, Card, Row, Col, Typography, 
  Statistic, Button, Space, Tag, Spin, message, theme // Importamos theme
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
const { useToken } = theme;

export default function Reportes() {
  const { token } = useToken();
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ventaAImprimir, setVentaAImprimir] = useState(null);
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
        message.error("Error al cargar las ventas");
        setLoading(false);
      });
  };

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Ticket_${ventaAImprimir?.id}`,
    onAfterPrint: () => setVentaAImprimir(null),
  });

  const prepararImpresion = (venta) => {
    if (!venta.detalles || venta.detalles.length === 0) {
      return message.warning("Venta sin detalles");
    }
    setVentaAImprimir(venta);
    setTimeout(() => { handlePrint(); }, 300);
  };

  const totalHistorico = ventas.reduce((acc, v) => acc + v.total, 0);
  const promedioVenta = ventas.length > 0 ? totalHistorico / ventas.length : 0;

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      fixed: 'left',
      render: (id) => <Text strong>#{id}</Text>,
    },
    {
      title: 'Fecha',
      dataIndex: 'fecha',
      key: 'fecha',
      responsive: ['sm'],
      render: (fecha) => new Date(fecha).toLocaleDateString(),
      sorter: (a, b) => new Date(a.fecha) - new Date(b.fecha),
    },
    {
      title: 'Productos',
      dataIndex: 'detalles',
      key: 'detalles',
      render: (detalles) => (
        <div style={{ maxWidth: '200px' }}>
          <Space wrap size={[0, 4]}>
            {detalles?.map((d, index) => (
              <Tag color={token.colorPrimary} key={index} style={{ fontSize: '10px', borderRadius: '4px' }}>
                {d.cantidad} {d.producto?.nombre}
              </Tag>
            ))}
          </Space>
        </div>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      align: 'right',
      render: (total) => (
        <Text strong style={{ color: token.colorSuccess, fontSize: '1.05rem' }}>
          {total.toFixed(2)} Bs
        </Text>
      ),
      sorter: (a, b) => a.total - b.total,
    },
    {
      title: 'Acción',
      key: 'acciones',
      fixed: 'right',
      width: 80,
      render: (_, record) => (
        <Button 
          type="text" 
          icon={<PrinterOutlined style={{ color: token.colorPrimary }} />} 
          onClick={() => prepararImpresion(record)}
        />
      ),
    },
  ];

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <Spin size="large" tip="Analizando..." />
    </div>
  );

  return (
    <div style={{ padding: 'clamp(10px, 3vw, 25px)', background: token.colorBgLayout, minHeight: '100vh' }}>
      <Title level={2} style={{ color: token.colorPrimary, marginBottom: '25px', fontSize: 'clamp(1.2rem, 5vw, 1.8rem)' }}>
        <BarChartOutlined /> Reportes de Venta
      </Title>

      {/* TARJETAS DE ESTADÍSTICAS RESPONSIVAS CON THEME */}
      <Row gutter={[16, 16]} style={{ marginBottom: '30px' }}>
        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false} style={{ borderLeft: `5px solid ${token.colorSuccess}`, borderRadius: '8px' }}>
            <Statistic
              title="Ingresos"
              value={totalHistorico}
              precision={2}
              valueStyle={{ color: token.colorSuccess, fontSize: '1.4rem' }}
              prefix={<DollarCircleOutlined />}
              suffix="Bs"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false} style={{ borderLeft: `5px solid ${token.colorPrimary}`, borderRadius: '8px' }}>
            <Statistic 
              title="Ventas Realizadas" 
              value={ventas.length} 
              prefix={<ShoppingOutlined />} 
              valueStyle={{ color: token.colorPrimary, fontSize: '1.4rem' }} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={24} lg={8}>
          <Card bordered={false} style={{ borderLeft: `5px solid ${token.colorWarning}`, borderRadius: '8px' }}>
            <Statistic 
              title="Ticket Promedio" 
              value={promedioVenta} 
              precision={2} 
              valueStyle={{ color: token.colorWarning, fontSize: '1.4rem' }} 
              prefix={<ArrowUpOutlined />} 
              suffix="Bs" 
            />
          </Card>
        </Col>
      </Row>

      <Card 
        title={<Text strong style={{ color: token.colorTextHeading }}>Historial de Transacciones</Text>}
        bordered={false} 
        style={{ borderRadius: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
        bodyStyle={{ padding: '10px' }}
      >
        <Table 
          columns={columns} 
          dataSource={ventas} 
          rowKey="id" 
          pagination={{ pageSize: 8, simple: window.innerWidth < 576 }} 
          scroll={{ x: 'max-content' }}
          size="middle"
        />
      </Card>

      <div style={{ display: 'none' }}>
        <TicketImprimible ref={componentRef} venta={ventaAImprimir} />
      </div>
    </div>
  );
}