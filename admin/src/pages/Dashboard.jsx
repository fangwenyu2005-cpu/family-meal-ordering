import { useState, useEffect, useCallback } from 'react';
import { Card, Col, Row, Statistic, Table, Button, Tag, message, Typography } from 'antd';
import {
  ShoppingCartOutlined,
  DollarOutlined,
  FileTextOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import api from '../utils/api';

const { Title } = Typography;

const statusColorMap = {
  SUBMITTED: 'blue',
  CONFIRMED: 'orange',
  PREPARING: 'purple',
  COMPLETED: 'green',
  CANCELLED: 'red',
};

const statusLabelMap = {
  SUBMITTED: '已提交',
  CONFIRMED: '已确认',
  PREPARING: '制作中',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
};

export default function Dashboard() {
  const [stats, setStats] = useState({ todayOrders: 0, todayRevenue: 0, totalOrders: 0 });
  const [pendingOrders, setPendingOrders] = useState([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await api.get('/api/stats/overview');
      setStats(res.data);
    } catch (err) {
      message.error('获取统计数据失败');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchPendingOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const res = await api.get('/api/admin/orders?status=SUBMITTED');
      setPendingOrders(res.data || []);
    } catch (err) {
      message.error('获取待处理订单失败');
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchPendingOrders();
    const interval = setInterval(fetchPendingOrders, 10000);
    return () => clearInterval(interval);
  }, [fetchStats, fetchPendingOrders]);

  const handleConfirm = async (id) => {
    try {
      await api.patch(`/api/admin/orders/${id}/status`, { status: 'CONFIRMED' });
      message.success('订单已确认');
      fetchPendingOrders();
      fetchStats();
    } catch (err) {
      const msg = err.response?.data?.message || '操作失败';
      message.error(msg);
    }
  };

  const orderColumns = [
    { title: '订单号', dataIndex: 'id', key: 'id', width: 80 },
    { title: '桌号', dataIndex: 'tableNumber', key: 'tableNumber', width: 80 },
    {
      title: '类型',
      dataIndex: 'orderType',
      key: 'orderType',
      width: 80,
      render: (v) => (v === 'DINE_IN' ? '堂食' : '打包'),
    },
    {
      title: '金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 100,
      render: (v) => `¥${Number(v).toFixed(2)}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (s) => <Tag color={statusColorMap[s]}>{statusLabelMap[s]}</Tag>,
    },
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (v) => (v ? new Date(v).toLocaleString('zh-CN') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<CheckOutlined />}
          onClick={() => handleConfirm(record.id)}
        >
          确认接单
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>
        仪表盘
      </Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="今日订单数"
              value={stats.todayOrders}
              prefix={<ShoppingCartOutlined />}
              loading={statsLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="今日营业额"
              value={stats.todayRevenue}
              precision={2}
              prefix={<DollarOutlined />}
              suffix="元"
              loading={statsLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="历史总订单"
              value={stats.totalOrders}
              prefix={<FileTextOutlined />}
              loading={statsLoading}
            />
          </Card>
        </Col>
      </Row>
      <Card title="待处理订单" styles={{ body: { padding: 0 } }}>
        <Table
          dataSource={pendingOrders}
          columns={orderColumns}
          rowKey="id"
          loading={ordersLoading}
          pagination={false}
          size="middle"
          scroll={{ x: 760 }}
        />
      </Card>
    </div>
  );
}
