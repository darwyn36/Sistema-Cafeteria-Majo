import React, { useState } from 'react';
import { Layout, Menu, ConfigProvider } from 'antd';
import { 
  ShoppingCartOutlined, 
  BarChartOutlined, 
  DatabaseOutlined, 
  SettingOutlined 
} from '@ant-design/icons';

// Componentes
import Pos from './components/Pos';
import Reportes from './components/Reportes';
import Inventario from './components/Inventario';
import GestionProductos from './components/GestionProductos';

const { Header, Content } = Layout;

function App() {
  const [vista, setVista] = useState('pos');

  const menuItems = [
    { key: 'pos', icon: <ShoppingCartOutlined />, label: 'POS' },
    { key: 'reportes', icon: <BarChartOutlined />, label: 'Reportes' },
    { key: 'inventario', icon: <DatabaseOutlined />, label: 'Inventario' },
    { key: 'gestion', icon: <SettingOutlined />, label: 'Gestión' },
  ];

  return (
    <ConfigProvider theme={{ token: { primaryColor: '#6f4e37' } }}>
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ background: '#4b3832', padding: 0 }}>
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[vista]}
            onClick={(e) => setVista(e.key)}
            items={menuItems}
            style={{ background: '#4b3832', lineHeight: '64px' }}
          />
        </Header>
        <Content>
          {vista === 'pos' && <Pos />}
          {vista === 'reportes' && <Reportes />}
          {vista === 'inventario' && <Inventario />}
          {vista === 'gestion' && <GestionProductos />}
        </Content>
      </Layout>
    </ConfigProvider>
  );
}

export default App;