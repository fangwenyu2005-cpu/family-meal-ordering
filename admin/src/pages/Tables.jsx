import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Tag,
  Typography,
  message,
  Space,
} from 'antd';
import { PlusOutlined, QrcodeOutlined } from '@ant-design/icons';
import api from '../utils/api';

const { Title, Text } = Typography;

export default function Tables() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const fetchTables = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/tables');
      setTables(res.data || []);
    } catch (err) {
      message.error('获取桌号列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const handleAdd = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await api.post('/api/admin/tables', { tableNumber: values.tableNumber });
      message.success('添加成功');
      setModalOpen(false);
      form.resetFields();
      fetchTables();
    } catch (err) {
      if (err.response) {
        const msg = err.response.data?.message || '添加失败';
        message.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const showQRCode = (url) => {
    Modal.info({
      title: '桌号二维码',
      content: (
        <div style={{ textAlign: 'center', padding: 16 }}>
          <img
            src={url}
            alt="二维码"
            style={{ width: 200, height: 200 }}
          />
          <div style={{ marginTop: 12 }}>
            <Text copyable>{url}</Text>
          </div>
        </div>
      ),
      okText: '关闭',
      width: 400,
    });
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
    { title: '桌号', dataIndex: 'tableNumber', key: 'tableNumber', width: 100 },
    {
      title: '二维码',
      dataIndex: 'qrCodeUrl',
      key: 'qrCodeUrl',
      width: 100,
      render: (url) =>
        url ? (
          <Button
            type="link"
            size="small"
            icon={<QrcodeOutlined />}
            onClick={() => showQRCode(url)}
          >
            查看
          </Button>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: '状态',
      dataIndex: 'active',
      key: 'active',
      width: 90,
      render: (v) =>
        v !== false ? <Tag color="green">启用</Tag> : <Tag color="red">停用</Tag>,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (v) => (v ? new Date(v).toLocaleString('zh-CN') : '-'),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>
        桌号管理
      </Title>
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            form.resetFields();
            setModalOpen(true);
          }}
        >
          添加桌号
        </Button>
      </div>
      <Table
        dataSource={tables}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 15, showTotal: (t) => `共 ${t} 桌` }}
        size="middle"
        scroll={{ x: 540 }}
      />

      <Modal
        title="添加桌号"
        open={modalOpen}
        onOk={handleAdd}
        onCancel={() => setModalOpen(false)}
        confirmLoading={submitting}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="tableNumber"
            label="桌号"
            rules={[{ required: true, message: '请输入桌号' }]}
          >
            <Input placeholder="例如：A1、B2" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
