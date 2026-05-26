import { useState, useEffect, useCallback } from 'react';
import { Card, Col, Row, Statistic, Table, Typography, message } from 'antd';
import { ShoppingCartOutlined, DollarOutlined, FileTextOutlined } from '@ant-design/icons';
import api from '../utils/api';

const { Title } = Typography;

export default function Stats() {
  const [stats, setStats] = useState({ todayOrders: 0, todayRevenue: 0, totalOrders: 0 });
  const [ranking, setRanking] = useState([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [rankingLoading, setRankingLoading] = useState(false);

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

  const fetchRanking = useCallback(async () => {
    setRankingLoading(true);
    try {
      const res = await api.get('/api/stats/ranking');
      setRanking(res.data || []);
    } catch (err) {
      message.error('获取排名数据失败');
    } finally {
      setRankingLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchRanking();
  }, [fetchStats, fetchRanking]);

  const columns = [
    {
      title: '排名',
      key: 'rank',
      width: 70,
      render: (_, __, index) => index + 1,
    },
    { title: '商品名', dataIndex: 'name', key: 'name' },
    { title: '分类', dataIndex: 'category_name', key: 'category_name', width: 120 },
    {
      title: '销量',
      dataIndex: 'total_qty',
      key: 'total_qty',
      width: 100,
      sorter: (a, b) => (a.total_qty || 0) - (b.total_qty || 0),
      defaultSortOrder: 'descend',
    },
    {
      title: '销售额',
      dataIndex: 'total_revenue',
      key: 'total_revenue',
      width: 120,
      sorter: (a, b) => (a.total_revenue || 0) - (b.total_revenue || 0),
      render: (v) => `¥${Number(v || 0).toFixed(2)}`,
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>
        流水统计
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
      <Card title="商品销售排行">
        <Table
          dataSource={ranking}
          columns={columns}
          rowKey="id"
          loading={rankingLoading}
          pagination={false}
          size="middle"
        />
      </Card>
    </div>
  );
}
