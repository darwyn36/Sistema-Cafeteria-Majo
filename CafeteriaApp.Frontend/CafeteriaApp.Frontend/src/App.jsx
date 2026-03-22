import React, { useState } from 'react';
import { Layout, Menu, ConfigProvider, Typography } from 'antd';
import { 
  ShoppingCartOutlined, 
  BarChartOutlined, 
  DatabaseOutlined, 
  SettingOutlined,
  CoffeeOutlined 
} from '@ant-design/icons';
import Pos from './components/Pos';
import Reportes from './components/Reportes';
import Inventario from './components/Inventario';
import GestionProductos from './components/GestionProductos';
import ThemeSelector from './components/common/ThemeSelector';

const { Sider, Content } = Layout;
const { Title } = Typography;

function App() {
  const [vista, setVista] = useState('pos');
  const [collapsed, setCollapsed] = useState(false);
  const [themeConfig, setThemeConfig] = useState({
    name: 'Café Clásico',
    color: '#6f4e37',
    sider: '#4b3832'
  });

  const menuItems = [
    { key: 'pos', icon: <ShoppingCartOutlined />, label: 'Punto de Venta' },
    { key: 'reportes', icon: <BarChartOutlined />, label: 'Reportes' },
    { key: 'inventario', icon: <DatabaseOutlined />, label: 'Inventario' },
    { key: 'gestion', icon: <SettingOutlined />, label: 'Gestión' },
  ];

  return (
    <ConfigProvider theme={{ token: { colorPrimary: themeConfig.color } }}>
      
      {/* Selector de Temas */}
      <ThemeSelector 
        currentTheme={themeConfig} 
        onThemeChange={(newTheme) => setThemeConfig(newTheme)} 
      />

      <Layout style={{ minHeight: '100vh' }}>
        <Sider 
          breakpoint="lg"
          collapsedWidth="0"
          onCollapse={(c) => setCollapsed(c)}
          width={250} 
          theme="dark" 
          style={{ 
            background: themeConfig.sider,
            position: 'fixed', 
            height: '100vh', 
            left: 0, 
            top: 0, 
            bottom: 0,
            zIndex: 1001 
          }}
        >
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <CoffeeOutlined style={{ fontSize: '32px', color: '#fff' }} />
            {!collapsed && (
               <Title level={4} style={{ color: '#fff', margin: '10px 0 0 0' }}>Cafetería Majo</Title>
            )}
          </div>
          
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[vista]}
            onClick={(e) => setVista(e.key)}
            items={menuItems}
            style={{ background: themeConfig.sider, borderRight: 0 }}
          />
        </Sider>

        <Layout style={{ 
          marginLeft: collapsed ? 0 : 250, 
          transition: 'all 0.2s' 
        }}> 
          <Content style={{ minHeight: '100vh', background: '#fdfaf6' }}>
            {vista === 'pos' && <Pos />}
            {vista === 'reportes' && <Reportes />}
            {vista === 'inventario' && <Inventario />}
            {vista === 'gestion' && <GestionProductos />}
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}

export default App;