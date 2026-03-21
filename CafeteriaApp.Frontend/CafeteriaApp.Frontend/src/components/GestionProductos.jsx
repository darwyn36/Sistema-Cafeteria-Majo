import React, { useState, useEffect } from 'react';
import { 
  Card, Form, Input, InputNumber, Button, Select, 
  Divider, Space, Typography, Upload, List, message, Row, Col 
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

export default function GestionProductos() {
  const [formInsumo] = Form.useForm();
  const [formProducto] = Form.useForm();
  const [insumosBD, setInsumosBD] = useState([]);
  const [receta, setReceta] = useState([]); // [{ insumoId, cantidadRequerida, nombre, unidad }]
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

  // --- GUARDAR NUEVO INSUMO ---
  const onFinishInsumo = async (values) => {
    try {
      await api.post('/insumos', values);
      message.success(`Insumo "${values.nombre}" registrado`);
      formInsumo.resetFields();
      cargarInsumos();
    } catch (error) {
      message.error("No se pudo crear el insumo");
    }
  };

  // --- GESTIÓN DE RECETA ---
  const agregarALaReceta = (id) => {
    if (!id) return;
    if (receta.find(r => r.insumoId === id)) {
      return message.warning("Este insumo ya está en la receta");
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

  // --- GUARDAR PRODUCTO FINAL ---
  const onFinishProducto = async (values) => {
    if (!archivo) return message.error("Por favor, sube una imagen del producto");
    if (receta.length === 0) return message.warning("La receta no puede estar vacía");

    setCargando(true);
    const formData = new FormData();
    formData.append('nombre', values.nombre);
    formData.append('precio', values.precio);
    formData.append('file', archivo);
    
    const recetaLimpia = receta.map(({insumoId, cantidadRequerida}) => ({insumoId, cantidadRequerida}));
    formData.append('ingredientesJson', JSON.stringify(recetaLimpia));

    try {
      await api.post('/productos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      Swal.fire('¡Creado!', 'Producto añadido al menú correctamente', 'success');
      formProducto.resetFields();
      setReceta([]);
      setArchivo(null);
    } catch (error) {
      message.error("Error al subir el producto");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ padding: '30px', background: '#fdfaf6', minHeight: '100vh' }}>
      <Row gutter={[24, 24]} justify="center">
        
        {/* SECCIÓN 1: INSUMOS */}
        <Col xs={24} lg={10}>
          <Card 
            title={<><DatabaseOutlined /> 1. Registrar Materia Prima</>} 
            bordered={false} 
            style={{ borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
          >
            <Form form={formInsumo} layout="vertical" onFinish={onFinishInsumo}>
              <Form.Item name="nombre" label="Nombre del Insumo" rules={[{ required: true }]}>
                <Input placeholder="Ej: Café en grano, Leche Entera" />
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

              <Form.Item name="stockMinimo" label="Stock de Alerta (Mínimo)" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>

              <Button type="primary" htmlType="submit" block icon={<PlusOutlined />} style={{ background: '#27ae60', borderColor: '#27ae60' }}>
                Registrar en Almacén
              </Button>
            </Form>
          </Card>
        </Col>

        {/* SECCIÓN 2: PRODUCTOS */}
        <Col xs={24} lg={12}>
          <Card 
            title={<><CoffeeOutlined /> 2. Crear Producto para el Menú</>} 
            bordered={false} 
            style={{ borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
          >
            <Form form={formProducto} layout="vertical" onFinish={onFinishProducto}>
              <Row gutter={16}>
                <Col span={14}>
                  <Form.Item name="nombre" label="Nombre del Café/Platillo" rules={[{ required: true }]}>
                    <Input placeholder="Ej: Cappuccino Vainilla" />
                  </Form.Item>
                </Col>
                <Col span={10}>
                  <Form.Item name="precio" label="Precio Venta" rules={[{ required: true }]}>
                    <InputNumber style={{ width: '100%' }} prefix="$" min={0} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="Imagen del Producto">
                <Upload.Dragger 
                  maxCount={1} 
                  beforeUpload={(file) => { setArchivo(file); return false; }}
                  onRemove={() => setArchivo(null)}
                >
                  <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                  <p className="ant-upload-text">Haz clic o arrastra la imagen aquí</p>
                </Upload.Dragger>
              </Form.Item>

              <Divider orientation="left">Receta (Ingredientes)</Divider>
              
              <Select 
                showSearch 
                placeholder="Seleccionar insumo para añadir..." 
                style={{ width: '100%', marginBottom: '15px' }}
                onChange={agregarALaReceta}
                optionFilterProp="children"
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
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                      <Text strong>{item.nombre}</Text>
                      <Space>
                        <InputNumber 
                          size="small" 
                          placeholder="Cant." 
                          onChange={(val) => actualizarCantidadReceta(item.insumoId, val)} 
                        />
                        <Text type="secondary">{item.unidad}</Text>
                      </Space>
                    </div>
                  </List.Item>
                )}
              />

              <Button 
                type="primary" 
                htmlType="submit" 
                block 
                size="large" 
                loading={cargando}
                icon={<SaveOutlined />}
                style={{ background: '#6f4e37', borderColor: '#6f4e37' }}
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