import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Input, Button, Modal, Form, Select, Space } from 'antd';

const LandingPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [form] = Form.useForm();

  const categories = [
    { label: 'All', value: null },
    { label: 'Electronics', value: 'electronics' },
    { label: 'Clothing', value: 'clothing' },
    { label: 'Books', value: 'books' },
  ];

  useEffect(() => {
    fetchItems();
  }, [selectedCategory]); // Refetch when category changes

  const fetchItems = async () => {
    setLoading(true);
    try {
      let url = 'http://localhost:8000/api/items/';
      if (selectedCategory) {
        url += `?category=${selectedCategory}`;
      }
      const response = await axios.get(url);
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
    setLoading(false);
  };

  const handleCreate = async (values) => {
    try {
      if (editingItem) {
        // Update existing item
        await axios.put(`http://localhost:8000/api/items/${editingItem.id}/`, values);
      } else {
        // Create new item
        await axios.post('http://localhost:8000/api/items/', values);
      }
      fetchItems();
      setIsModalVisible(false);
      setEditingItem(null);
      form.resetFields();
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const handleEdit = (record) => {
    setEditingItem(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/items/${id}/`);
      fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingItem(null);
    form.resetFields();
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <span>
          <Button type="link" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>
            Delete
          </Button>
        </span>
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className="mb-4 flex justify-between items-center">
        <Space>
          <Input
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 200 }}
          />
          <Select
            placeholder="Filter by category"
            value={selectedCategory}
            onChange={handleCategoryChange}
            style={{ width: 150 }}
          >
            {categories.map(category => (
              <Select.Option key={category.value || 'all'} value={category.value}>
                {category.label}
              </Select.Option>
            ))}
          </Select>
        </Space>
        <Button type="primary" onClick={() => setIsModalVisible(true)}>
          Add New Item
        </Button>
      </div>

      <Table
        dataSource={items}
        columns={columns}
        loading={loading}
        rowKey="id"
      />

      <Modal
        title={editingItem ? "Edit Item" : "Add New Item"}
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
      >
        <Form 
          form={form} 
          onFinish={handleCreate}
          initialValues={editingItem}
        >
          <Form.Item
            name="name"
            rules={[{ required: true, message: 'Please input the name!' }]}
          >
            <Input placeholder="Name" />
          </Form.Item>
          <Form.Item
            name="category"
            rules={[{ required: true, message: 'Please select the category!' }]}
          >
            <Select placeholder="Select category">
              <Select.Option value="electronics">Electronics</Select.Option>
              <Select.Option value="clothing">Clothing</Select.Option>
              <Select.Option value="books">Books</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="price"
            rules={[{ required: true, message: 'Please input the price!' }]}
          >
            <Input type="number" placeholder="Price" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingItem ? 'Update' : 'Create'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LandingPage; 