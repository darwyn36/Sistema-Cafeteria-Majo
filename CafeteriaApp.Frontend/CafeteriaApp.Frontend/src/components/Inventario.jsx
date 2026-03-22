import React, { useEffect, useState } from 'react';
import { 
  Table, Tag, Button, Typography, Space, 
  Card, InputNumber, Modal, message, Tooltip, Empty, theme
} from 'antd';
import { 
  ReloadOutlined, 
  PlusOutlined, 
  DeleteOutlined, 
  WarningOutlined, 
  CheckCircleOutlined,
  DatabaseOutlined
} from '@ant-design/icons';
import api from '../api/api';

const { Title, Text } = Typography;
const { useToken } = theme;

export default function Inventario() {
  const { token } = useToken();
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarInsumos();
  }, []);

  const cargarInsumos = async () => {
    setLoading(true);
    try {
      const res = await api.get('/insumos');
      setInsumos(res.data);
    } catch (err) {
      message.error("No se pudo cargar el inventario");
    } finally {
      setLoading(false);
    }
  };

  // --- FUNCIÓN PARA SURTIR STOCK ---
  const handleSurtir = (record) => {
    let cantidadASumar = 0;
    Modal.confirm({
      title: `Surtir ${record.nombre}`,
      icon: <PlusOutlined style={{ color: token.colorPrimary }} />,
      content: (
        <div style={{ marginTop: '15px' }}>
          <Text>¿Cuántas unidades/gramos llegaron?</Text>
          <br />
          <InputNumber 
            style={{ width: '100%', marginTop: '10px' }} 
            min={1} 
            placeholder="Ej: 500" 
            onChange={(val) => cantidadASumar = val}
          />
        </div>
      ),
      okText: 'Sumar al Stock',
      okButtonProps: { style: { background: token.colorPrimary, borderColor: token.colorPrimary } },
      cancelText: 'Cancelar',
      onOk: async () => {
        if (!cantidadASumar || cantidadASumar <= 0) {
          message.warning("Ingresa una cantidad válida");
          return;
        }
        try {
          const nuevoStock = parseFloat(record.stockActual) + parseFloat(cantidadASumar);
          await api.post('/insumos', {
            ...record,
            stockActual: nuevoStock
          });
          message.success(`Stock de ${record.nombre} actualizado`);
          cargarInsumos();
        } catch (error) {
          message.error("Error al actualizar el stock");
        }
      },
    });
  };

  const handleEliminar = (id) => {
    Modal.confirm({
      title: '¿Eliminar insumo?',
      icon: <WarningOutlined style={{ color: token.colorError }} />,
      content: 'Esta acción podría afectar a las recetas.',
      okText: 'Sí, borrar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await api.delete(`/insumos/${id}`);
          message.success("Insumo eliminado");
          cargarInsumos();
        } catch (error) {
          message.error("No se puede eliminar");
        }
      },
    });
  };

  const columns = [
    {
      title: 'Insumo',
      dataIndex: 'nombre',
      key: 'nombre',
      fixed: 'left',
      render: (text) => <Text strong>{text}</Text>,
      sorter: (a, b) => a.nombre.localeCompare(b.nombre),
    },
    {
      title: 'Stock Actual',
      key: 'stockActual',
      render: (_, record) => {
        const esBajo = record.stockActual <= record.stockMinimo;
        return (
          <Text strong style={{ color: esBajo ? token.colorError : token.colorText }}>
            {record.stockActual} {record.unidadMedida}
          </Text>
        );
      },
    },
    {
      title: 'Mínimo',
      dataIndex: 'stockMinimo',
      key: 'stockMinimo',
      responsive: ['md'],
    },
    {
      title: 'Estado',
      key: 'estado',
      render: (_, record) => (
        record.stockActual <= record.stockMinimo ? 
          <Tag icon={<WarningOutlined />} color="error">REPONER</Tag> : 
          <Tag icon={<CheckCircleOutlined />} color="success">OK</Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      fixed: 'right',
      render: (_, record) => (
        <Space wrap>
          <Button 
            type="primary" 
            size="small"
            icon={<PlusOutlined />} 
            onClick={() => handleSurtir(record)}
            style={{ background: token.colorPrimary, borderColor: token.colorPrimary }}
          >
            Surtir
          </Button>
          <Button 
            danger 
            type="text"
            size="small"
            icon={<DeleteOutlined />} 
            onClick={() => handleEliminar(record.id)} 
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 'clamp(10px, 3vw, 30px)', background: '#f8f9fa', minHeight: '100vh' }}>
      <Card 
        bordered={false} 
        style={{ borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
        bodyStyle={{ padding: 'clamp(12px, 2vw, 24px)' }}
      >
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '15px',
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '20px' 
        }}>
          <Title level={2} style={{ margin: 0, color: token.colorPrimary, fontSize: 'clamp(1.2rem, 5vw, 1.8rem)' }}>
            <DatabaseOutlined /> Inventario
          </Title>
          <Button 
            type="default" 
            icon={<ReloadOutlined />} 
            onClick={cargarInsumos}
            block={window.innerWidth < 576}
          >
            Actualizar
          </Button>
        </div>

        <Table 
          columns={columns} 
          dataSource={insumos} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 8, responsive: true }}
          scroll={{ x: 'max-content' }}
          size="middle"
          locale={{ emptyText: <Empty description="Sin insumos registrados." /> }}
        />
      </Card>
    </div>
  );
}