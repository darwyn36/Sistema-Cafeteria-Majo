import React, { useEffect, useState } from 'react';
import { 
  Card, Form, Input, InputNumber, Button, Select, 
  Divider, Space, Typography, Upload, List, message, Row, Col, theme
} from 'antd';
import { 
  PlusOutlined, 
  InboxOutlined, 
  DeleteOutlined, 
  CoffeeOutlined, 
  DatabaseOutlined,
  SaveOutlined 
} from '@ant-design/icons';
import api from '../api/api';
import Swal from 'sweetalert2';

const { Title, Text } = Typography;
const { Option } = Select;
const { useToken } = theme;

export default function GestionProductos() {
  const { token } = useToken();
  const [formInsumo] = Form.useForm();
  const [formProducto] = Form.useForm();
  const [insumosBD, setInsumosBD] = useState([]);
  const [receta, setReceta] = useState([]); 
  const [archivo, setArchivo] = useState(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    cargarInsumos();
  }, []);

  const cargarInsumos = async () => {
    try {
      const res = await api.get('/insumos');
      setInsumosBD(res.data);
    } catch (error) {
      message.error("Error al cargar insumos");
    }
  };

  const onFinishInsumo = async (values) => {
    try {
      await api.post('/insumos', values);
      message.success(`Insumo registrado`);
      formInsumo.resetFields();
      cargarInsumos();
    } catch (error) {
      message.error("No se pudo crear el insumo");
    }
  };

  const agregarALaReceta = (id) => {
    if (!id) return;
    if (receta.find(r => r.insumoId === id)) {
      return message.warning("Ya está en la receta");
    }
    const insumo = insumosBD.find(i => i.id === id);
    setReceta([...receta, { 
      insumoId: id, 
      cantidadRequerida: 0, 
      nombre: insumo.nombre, 
      unidad: insumo.unidadMedida 
    }]);
  };

  const actualizarCantidadReceta = (id, cant) => {
    setReceta(receta.map(r => 
      r.insumoId === id ? { ...r, cantidadRequerida: cant || 0 } : r
    ));
  };

  const quitarDeReceta = (id) => {
    setReceta(receta.filter(r => r.insumoId !== id));
  };

  const onFinishProducto = async (values) => {
    if (!archivo) return message.error("Sube una imagen");
    if (receta.length === 0) return message.warning("Receta vacía");

    setCargando(true);
    const formData = new FormData();
    formData.append('nombre', values.nombre);
    formData.append('precio', values.precio);
    formData.append('file', archivo);
    const recetaLimpia = receta.map(({insumoId, cantidadRequerida}) => ({insumoId, cantidadRequerida}));
    formData.append('ingredientesJson', JSON.stringify(recetaLimpia));

    try {
      await api.post('/productos/upload', formData);
      Swal.fire('¡Éxito!', 'Producto creado', 'success');
      formProducto.resetFields();
      setReceta([]);
      setArchivo(null);
    } catch (error) {
      message.error("Error al subir");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ padding: 'clamp(10px, 3vw, 30px)', background: '#fdfaf6', minHeight: '100vh' }}>
      <Row gutter={[24, 24]} justify="center">
        
        {/*INSUMOS */}
        <Col xs={24} lg={10}>
          <Card 
            title={<Text strong style={{ color: token.colorPrimary }}><DatabaseOutlined /> 1. Materia Prima</Text>} 
            bordered={false} 
            style={{ borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
          >
            <Form form={formInsumo} layout="vertical" onFinish={onFinishInsumo}>
              <Form.Item name="nombre" label="Nombre" rules={[{ required: true }]}>
                <Input placeholder="Ej: Café en grano" />
              </Form.Item>
              
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="unidadMedida" label="Unidad" rules={[{ required: true }]}>
                    <Select placeholder="Seleccionar">
                      <Option value="gramos">Gramos (g)</Option>
                      <Option value="ml">Mililitros (ml)</Option>
                      <Option value="unidades">Unidades</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="stockActual" label="Stock Inicial" rules={[{ required: true }]}>
                    <InputNumber style={{ width: '100%' }} min={0} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="stockMinimo" label="Alerta de Stock Mínimo" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>

              {/* Botón usa el color dinámico */}
              <Button 
                type="primary" 
                htmlType="submit" 
                block 
                icon={<PlusOutlined />} 
                style={{ backgroundColor: token.colorPrimary, borderColor: token.colorPrimary }}
              >
                Registrar en Almacén
              </Button>
            </Form>
          </Card>
        </Col>

        {/* SECCIÓN 2: PRODUCTOS */}
        <Col xs={24} lg={12}>
          <Card 
            title={<Text strong style={{ color: token.colorPrimary }}><CoffeeOutlined /> 2. Producto del Menú</Text>} 
            bordered={false} 
            style={{ borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
          >
            <Form form={formProducto} layout="vertical" onFinish={onFinishProducto}>
              <Row gutter={16}>
                <Col span={14}>
                  <Form.Item name="nombre" label="Nombre" rules={[{ required: true }]}>
                    <Input placeholder="Ej: Cappuccino" />
                  </Form.Item>
                </Col>
                <Col span={10}>
                  <Form.Item name="precio" label="Precio" rules={[{ required: true }]}>
                    <InputNumber style={{ width: '100%' }} prefix="Bs" min={0} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="Imagen del Producto">
                <Upload.Dragger 
                  maxCount={1} 
                  beforeUpload={(file) => { setArchivo(file); return false; }}
                  onRemove={() => setArchivo(null)}
                >
                  <p className="ant-upload-drag-icon"><InboxOutlined style={{ color: token.colorPrimary }} /></p>
                  <p className="ant-upload-text">Arrastra la imagen aquí</p>
                </Upload.Dragger>
              </Form.Item>

              <Divider orientation="left">Receta</Divider>
              
              <Select 
                showSearch 
                placeholder="Añadir insumo..." 
                style={{ width: '100%', marginBottom: '15px' }}
                onChange={agregarALaReceta}
                value={null}
              >
                {insumosBD.map(i => (
                  <Option key={i.id} value={i.id}>{i.nombre} ({i.unidadMedida})</Option>
                ))}
              </Select>

              <List
                bordered
                dataSource={receta}
                style={{ background: '#fafafa', borderRadius: '8px', marginBottom: '20px' }}
                renderItem={item => (
                  <List.Item
                    actions={[
                      <Button danger type="text" icon={<DeleteOutlined />} onClick={() => quitarDeReceta(item.insumoId)} />
                    ]}
                  >
                    <Space>
                      <Text strong>{item.nombre}</Text>
                      <InputNumber 
                        size="small" 
                        placeholder="Cant." 
                        onChange={(val) => actualizarCantidadReceta(item.insumoId, val)} 
                      />
                      <Text type="secondary">{item.unidad}</Text>
                    </Space>
                  </List.Item>
                )}
              />

              {/* Botón usa el color dinámico */}
              <Button 
                type="primary" 
                htmlType="submit" 
                block 
                size="large" 
                loading={cargando}
                icon={<SaveOutlined />}
                style={{ backgroundColor: token.colorPrimary, borderColor: token.colorPrimary }}
              >
                Guardar Producto Final
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
}