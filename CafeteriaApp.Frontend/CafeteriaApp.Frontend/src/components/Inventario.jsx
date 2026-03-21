import React, { useEffect, useState } from 'react';
import { 
  Table, Tag, Button, Typography, Space, 
  Card, InputNumber, Modal, message, Tooltip, Empty 
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
import Swal from 'sweetalert2';

const { Title, Text } = Typography;

export default function Inventario() {
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
      icon: <PlusOutlined style={{ color: '#27ae60' }} />,
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
      okButtonProps: { style: { background: '#27ae60', borderColor: '#27ae60' } },
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
          message.success(`Stock de ${record.nombre} actualizado a ${nuevoStock}`);
          cargarInsumos();
        } catch (error) {
          message.error("Error al actualizar el stock");
        }
      },
    });
  };

  // --- FUNCIÓN PARA ELIMINAR ---
  const handleEliminar = (id) => {
    Modal.confirm({
      title: '¿Eliminar insumo?',
      icon: <WarningOutlined style={{ color: '#ff4d4f' }} />,
      content: 'Esta acción podría afectar a las recetas que usan este producto.',
      okText: 'Sí, borrar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await api.delete(`/insumos/${id}`);
          message.success("Insumo eliminado correctamente");
          cargarInsumos();
        } catch (error) {
          message.error("No se puede eliminar (posiblemente está en uso)");
        }
      },
    });
  };

  // --- CONFIGURACIÓN DE COLUMNAS ---
  const columns = [
    {
      title: 'Insumo',
      dataIndex: 'nombre',
      key: 'nombre',
      render: (text) => <Text strong>{text}</Text>,
      sorter: (a, b) => a.nombre.localeCompare(b.nombre),
    },
    {
      title: 'Stock Actual',
      key: 'stockActual',
      render: (_, record) => (
        <Text strong style={{ color: record.stockActual <= record.stockMinimo ? '#ff4d4f' : '#262626' }}>
          {record.stockActual} {record.unidadMedida}
        </Text>
      ),
      sorter: (a, b) => a.stockActual - b.stockActual,
    },
    {
      title: 'Mínimo',
      dataIndex: 'stockMinimo',
      key: 'stockMinimo',
    },
    {
      title: 'Estado',
      key: 'estado',
      render: (_, record) => (
        record.stockActual <= record.stockMinimo ? 
          <Tag icon={<WarningOutlined />} color="error">REPONER</Tag> : 
          <Tag icon={<CheckCircleOutlined />} color="success">OK</Tag>
      ),
      filters: [
        { text: 'Reponer', value: 'reponer' },
        { text: 'OK', value: 'ok' },
      ],
      onFilter: (value, record) => {
        const estado = record.stockActual <= record.stockMinimo ? 'reponer' : 'ok';
        return estado === value;
      },
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_, record) => (
        <Space>
          <Tooltip title="Aumentar Stock">
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => handleSurtir(record)}
              style={{ background: '#27ae60', borderColor: '#27ae60' }}
            >
              Surtir
            </Button>
          </Tooltip>
          <Tooltip title="Eliminar">
            <Button 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => handleEliminar(record.id)} 
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '30px', background: '#f0f2f5', minHeight: '100vh' }}>
      <Card bordered={false} style={{ borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <Title level={2} style={{ margin: 0, color: '#4b3832' }}>
            <DatabaseOutlined /> Control de Inventario
          </Title>
          <Button 
            type="default" 
            icon={<ReloadOutlined />} 
            onClick={cargarInsumos}
          >
            Actualizar
          </Button>
        </div>

        <Table 
          columns={columns} 
          dataSource={insumos} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 8 }}
          locale={{ emptyText: <Empty description="No hay insumos. Ve a Gestión para agregar." /> }}
        />
      </Card>
    </div>
  );
}