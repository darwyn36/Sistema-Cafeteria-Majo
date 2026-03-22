import React, { useState } from 'react';
import { Button, Modal, Row, Col, Card, Typography } from 'antd';
import { SkinOutlined, CheckCircleFilled } from '@ant-design/icons';

const { Text } = Typography;

const temas = [
  { name: 'Café Clásico', color: '#6f4e37', sider: '#4b3832' },
  { name: 'Noche Elegante', color: '#1677ff', sider: '#001529' },
  { name: 'Bosque', color: '#27ae60', sider: '#1b4d3e' },
  { name: 'Vino', color: '#921010', sider: '#4a0808' },
  { name: 'Industrial', color: '#262626', sider: '#141414' },
];

export default function ThemeSelector({ currentTheme, onThemeChange }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button 
        type="default"
        shape="circle"
        icon={<SkinOutlined />}
        onClick={() => setIsModalOpen(true)}
        style={{ 
          position: 'fixed', 
          top: 20, 
          right: 20, 
          zIndex: 2000,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)' 
        }}
      />

      <Modal
        title="Personalizar Apariencia"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Row gutter={[16, 16]}>
          {temas.map((t) => (
            <Col span={12} key={t.name}>
              <Card
                hoverable
                size="small"
                onClick={() => onThemeChange(t)}
                style={{ 
                  border: currentTheme.name === t.name ? `2px solid ${t.color}` : '2px solid #f0f0f0',
                  textAlign: 'center'
                }}
              >
                <div style={{ 
                  backgroundColor: t.color, 
                  height: 40, 
                  borderRadius: 4, 
                  marginBottom: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {currentTheme.name === t.name && <CheckCircleFilled style={{ color: '#fff' }} />}
                </div>
                <Text strong>{t.name}</Text>
              </Card>
            </Col>
          ))}
        </Row>
      </Modal>
    </>
  );
}