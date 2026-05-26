import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Typography } from 'antd';
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  MenuOutlined,
  BarChartOutlined,
  TableOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import MenuPage from './pages/Menu';
import Stats from './pages/Stats';
import Tables from './pages/Tables';
import './App.css';

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: '仪表盘' },
  { key: '/orders', icon: <ShoppingCartOutlined />, label: '订单管理' },
  { key: '/menu', icon: <MenuOutlined />, label: '菜单管理' },
  { key: '/stats', icon: <BarChartOutlined />, label: '流水统计' },
  { key: '/tables', icon: <TableOutlined />, label: '桌号管理' },
];

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const currentKey = '/' + location.pathname.split('/')[1];
  const selectedKey = menuItems.find((item) => item.key === currentKey) ? currentKey : '/';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const username = localStorage.getItem('username') || '管理员';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        style={{ background: '#fff' }}
      >
        <div className="sider-logo">
          <Typography.Title level={5} style={{ margin: 0 }}>
            咖啡店管理
          </Typography.Title>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Header className="app-header">
          <Typography.Text type="secondary" style={{ marginRight: 16 }}>
            {username}
          </Typography.Text>
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            danger
          >
            退出登录
          </Button>
        </Header>
        <Content style={{ margin: 24 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/tables" element={<Tables />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
