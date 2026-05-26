import { useState, useEffect, useCallback } from 'react';
import {
  Row,
  Col,
  List,
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Checkbox,
  Typography,
  Popconfirm,
  message,
  Space,
  Tag,
  Spin,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../utils/api';

const { Title } = Typography;

export default function Menu() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [catLoading, setCatLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [availableSpecGroups, setAvailableSpecGroups] = useState([]);

  const fetchCategories = useCallback(async () => {
    setCatLoading(true);
    try {
      const res = await api.get('/api/categories');
      setCategories(res.data || []);
      if (res.data && res.data.length > 0 && !selectedCategory) {
        setSelectedCategory(res.data[0].id);
      }
    } catch (err) {
      message.error('获取分类列表失败');
    } finally {
      setCatLoading(false);
    }
  }, [selectedCategory]);

  const fetchProducts = useCallback(async () => {
    if (!selectedCategory) return;
    setLoading(true);
    try {
      const res = await api.get('/api/products', { params: { category: selectedCategory } });
      setProducts(res.data || []);
    } catch (err) {
      message.error('获取商品列表失败');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  const fetchSpecGroups = useCallback(async () => {
    try {
      const res = await api.get('/api/categories');
      setAvailableSpecGroups(res.data || []);
    } catch {
      // Silently fail if endpoint not available
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchSpecGroups();
  }, [fetchCategories, fetchSpecGroups]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAdd = () => {
    setEditingProduct(null);
    form.resetFields();
    form.setFieldsValue({ sortOrder: 0, basePrice: 0, isAvailable: true, specGroupIds: [] });
    setModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingProduct(record);
    form.setFieldsValue({
      name: record.name,
      description: record.description || '',
      basePrice: record.basePrice,
      imageUrl: record.imageUrl || '',
      sortOrder: record.sortOrder || 0,
      isAvailable: record.isAvailable !== false,
      specGroupIds: record.specGroupIds || [],
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/admin/products/${id}`);
      message.success('删除成功');
      fetchProducts();
    } catch (err) {
      const msg = err.response?.data?.message || '删除失败';
      message.error(msg);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const payload = {
        categoryId: selectedCategory,
        name: values.name,
        description: values.description || '',
        imageUrl: values.imageUrl || '',
        basePrice: values.basePrice,
        sortOrder: values.sortOrder,
        specGroupIds: values.specGroupIds || [],
        isAvailable: values.isAvailable,
      };

      if (editingProduct) {
        await api.put(`/api/admin/products/${editingProduct.id}`, payload);
        message.success('更新成功');
      } else {
        await api.post('/api/admin/products', payload);
        message.success('添加成功');
      }

      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      if (err.response) {
        const msg = err.response.data?.message || '操作失败';
        message.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    {
      title: '图片',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 80,
      render: (url) =>
        url ? (
          <img
            src={url}
            alt=""
            style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4 }}
          />
        ) : (
          <div
            style={{
              width: 48,
              height: 48,
              background: '#f0f0f0',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#bbb',
            }}
          >
            无图
          </div>
        ),
    },
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
    {
      title: '价格',
      dataIndex: 'basePrice',
      key: 'basePrice',
      width: 90,
      render: (v) => `¥${Number(v).toFixed(2)}`,
    },
    { title: '排序', dataIndex: 'sortOrder', key: 'sortOrder', width: 70 },
    {
      title: '状态',
      dataIndex: 'isAvailable',
      key: 'isAvailable',
      width: 80,
      render: (v) =>
        v !== false ? <Tag color="green">上架</Tag> : <Tag color="red">下架</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(record);
            }}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除此商品？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>
        菜单管理
      </Title>
      <Row gutter={24}>
        <Col xs={24} sm={6}>
          <div
            style={{
              background: '#fff',
              borderRadius: 8,
              padding: '12px 0',
              border: '1px solid #f0f0f0',
            }}
          >
            <div style={{ padding: '0 16px', marginBottom: 8 }}>
              <Typography.Text strong>商品分类</Typography.Text>
            </div>
            {catLoading ? (
              <div style={{ textAlign: 'center', padding: 24 }}>
                <Spin />
              </div>
            ) : (
              <List
                dataSource={categories}
                split={false}
                renderItem={(item) => (
                  <List.Item
                    onClick={() => setSelectedCategory(item.id)}
                    style={{
                      cursor: 'pointer',
                      padding: '10px 16px',
                      background:
                        selectedCategory === item.id ? '#e6f4ff' : 'transparent',
                      borderRight:
                        selectedCategory === item.id ? '3px solid #1677ff' : 'none',
                    }}
                  >
                    <Typography.Text
                      strong={selectedCategory === item.id}
                      style={{
                        color: selectedCategory === item.id ? '#1677ff' : undefined,
                      }}
                    >
                      {item.name}
                    </Typography.Text>
                  </List.Item>
                )}
              />
            )}
          </div>
        </Col>
        <Col xs={24} sm={18}>
          <div style={{ marginBottom: 16 }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              添加商品
            </Button>
          </div>
          <Table
            dataSource={products}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
            size="middle"
            scroll={{ x: 800 }}
          />
        </Col>
      </Row>

      <Modal
        title={editingProduct ? '编辑商品' : '添加商品'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        confirmLoading={submitting}
        destroyOnClose
        width={560}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="商品名称"
            rules={[{ required: true, message: '请输入商品名称' }]}
          >
            <Input placeholder="请输入商品名称" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="请输入商品描述" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="basePrice"
                label="价格"
                rules={[{ required: true, message: '请输入价格' }]}
              >
                <InputNumber
                  min={0}
                  step={0.01}
                  precision={2}
                  style={{ width: '100%' }}
                  prefix="￥"
                  placeholder="0.00"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="sortOrder" label="排序">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="imageUrl" label="图片URL">
            <Input placeholder="请输入图片URL" />
          </Form.Item>
          <Form.Item name="isAvailable" label="状态" valuePropName="checked">
            <Checkbox>上架</Checkbox>
          </Form.Item>
          <Form.Item name="specGroupIds" label="关联规格组">
            <Checkbox.Group>
              <Row>
                {availableSpecGroups.map((cat) => (
                  <Col span={8} key={cat.id}>
                    <Checkbox value={cat.id}>{cat.name}</Checkbox>
                  </Col>
                ))}
              </Row>
            </Checkbox.Group>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
