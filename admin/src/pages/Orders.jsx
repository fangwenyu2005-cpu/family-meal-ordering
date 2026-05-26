import { useState, useEffect, useCallback } from 'react';
import { Table, Tag, Button, Drawer, Tabs, Typography, message, Popconfirm, Space } from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  PlayCircleOutlined,
  StopOutlined,
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

const orderTypeLabelMap = {
  DINE_IN: '堂食',
  TAKEOUT: '打包',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = activeTab !== 'ALL' ? { status: activeTab } : {};
      const res = await api.get('/api/admin/orders', { params });
      setOrders(res.data || []);
    } catch (err) {
      message.error('获取订单列表失败');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/api/admin/orders/${id}/status`, { status });
      message.success('状态更新成功');
      fetchOrders();
    } catch (err) {
      const msg = err.response?.data?.message || '操作失败';
      message.error(msg);
    }
  };

  const showDetail = (record) => {
    setSelectedOrder(record);
    setDrawerOpen(true);
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
    { title: '桌号', dataIndex: 'tableNumber', key: 'tableNumber', width: 70 },
    {
      title: '类型',
      dataIndex: 'orderType',
      key: 'orderType',
      width: 70,
      render: (v) => orderTypeLabelMap[v] || v,
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
      width: 90,
      render: (s) => <Tag color={statusColorMap[s]}>{statusLabelMap[s]}</Tag>,
    },
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (v) => (v ? new Date(v).toLocaleString('zh-CN') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          {record.status === 'SUBMITTED' && (
            <>
              <Button
                type="primary"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleStatusChange(record.id, 'CONFIRMED')}
              >
                确认
              </Button>
              <Popconfirm
                title="确定取消此订单？"
                onConfirm={() => handleStatusChange(record.id, 'CANCELLED')}
                okText="确定"
                cancelText="取消"
              >
                <Button size="small" danger icon={<CloseOutlined />}>
                  取消
                </Button>
              </Popconfirm>
            </>
          )}
          {record.status === 'CONFIRMED' && (
            <Button
              type="primary"
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => handleStatusChange(record.id, 'PREPARING')}
            >
              开始制作
            </Button>
          )}
          {record.status === 'PREPARING' && (
            <Button
              type="primary"
              size="small"
              icon={<StopOutlined />}
              onClick={() => handleStatusChange(record.id, 'COMPLETED')}
            >
              完成
            </Button>
          )}
          {record.status === 'COMPLETED' && (
            <Tag color="green">已完成</Tag>
          )}
          {record.status === 'CANCELLED' && (
            <Tag color="red">已取消</Tag>
          )}
        </Space>
      ),
    },
  ];

  const tabItems = [
    { key: 'ALL', label: '全部' },
    { key: 'SUBMITTED', label: '已提交' },
    { key: 'CONFIRMED', label: '已确认' },
    { key: 'PREPARING', label: '制作中' },
    { key: 'COMPLETED', label: '已完成' },
    { key: 'CANCELLED', label: '已取消' },
  ];

  const orderItemColumns = [
    { title: '商品名', dataIndex: 'productName', key: 'productName' },
    { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 70 },
    { title: '单价', dataIndex: 'price', key: 'price', width: 100, render: (v) => `¥${Number(v).toFixed(2)}` },
    {
      title: '小计',
      key: 'subtotal',
      width: 100,
      render: (_, r) => `¥${(Number(r.price) * r.quantity).toFixed(2)}`,
    },
    {
      title: '规格',
      dataIndex: 'specs',
      key: 'specs',
      render: (specs) =>
        specs && specs.length > 0
          ? specs.map((s) => s.name || s.specName || s.value).join(' / ')
          : '-',
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>
        订单管理
      </Title>
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      <Table
        dataSource={orders}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 15, showSizeChanger: true, showTotal: (t) => `共 ${t} 条` }}
        size="middle"
        scroll={{ x: 840 }}
        onRow={(record) => ({
          onClick: () => showDetail(record),
          style: { cursor: 'pointer' },
        })}
      />
      <Drawer
        title={`订单详情 #${selectedOrder?.id || ''}`}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={600}
      >
        {selectedOrder && (
          <div>
            <p><strong>桌号：</strong>{selectedOrder.tableNumber}</p>
            <p><strong>类型：</strong>{orderTypeLabelMap[selectedOrder.orderType] || selectedOrder.orderType}</p>
            <p><strong>金额：</strong>¥{Number(selectedOrder.totalAmount).toFixed(2)}</p>
            <p>
              <strong>状态：</strong>
              <Tag color={statusColorMap[selectedOrder.status]}>
                {statusLabelMap[selectedOrder.status]}
              </Tag>
            </p>
            <p><strong>时间：</strong>{selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString('zh-CN') : '-'}</p>
            {selectedOrder.note && <p><strong>备注：</strong>{selectedOrder.note}</p>}
            <Title level={5} style={{ marginTop: 24 }}>
              订单明细
            </Title>
            <Table
              dataSource={selectedOrder.items || []}
              columns={orderItemColumns}
              rowKey="id"
              pagination={false}
              size="small"
              summary={() => (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={4}>
                    <strong>合计</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <strong>¥{Number(selectedOrder.totalAmount).toFixed(2)}</strong>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              )}
            />
          </div>
        )}
      </Drawer>
    </div>
  );
}
