import { useState, useEffect, useContext } from "react";
import {
  Card,
  Table,
  Tag,
  Space,
  Typography,
  Select,
  Row,
  Col,
  Statistic,
  Avatar,
  message,
  Spin,
  Tooltip,
  Button,
  Popconfirm,
  Input,
} from "antd";
import {
  ShoppingCartOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  TruckOutlined,
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { toast } from "react-toastify";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

const { Title, Text } = Typography;
const { Option } = Select;

const Orders = ({ url }) => {
  const navigate = useNavigate();
  const { token, admin } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState({});
  const [searchText, setSearchText] = useState("");

  const fetchAllOrder = async () => {
    setLoading(true);
    try {
      const response = await axios.get(url + "/api/order/list", {
        headers: { token },
      });
      if (response.data.success) {
        setOrders(response.data.data);
        setFilteredOrders(response.data.data);
      } else {
        message.error("Failed to fetch orders");
      }
    } catch (error) {
      message.error("Error fetching orders");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
    if (!value.trim()) {
      setFilteredOrders(orders);
      return;
    }

    const filtered = orders.filter((order) => {
      const orderId = order._id.toLowerCase();
      const customerName = order.address.name.toLowerCase();
      const status = order.status.toLowerCase();
      const searchValue = value.toLowerCase();

      return (
        orderId.includes(searchValue) ||
        customerName.includes(searchValue) ||
        status.includes(searchValue)
      );
    });
    setFilteredOrders(filtered);
  };

  const statusHandler = async (orderId, newStatus) => {
    setUpdateLoading((prev) => ({ ...prev, [orderId]: true }));
    try {
      const response = await axios.post(
        url + "/api/order/status",
        {
          orderId,
          status: newStatus,
        },
        { headers: { token } }
      );
      if (response.data.success) {
        message.success(response.data.message);
        await fetchAllOrder();
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error("Error updating order status");
    } finally {
      setUpdateLoading((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const deleteOrder = async (orderId) => {
    setUpdateLoading((prev) => ({ ...prev, [orderId]: true }));
    try {
      const response = await axios.delete(
        url + `/api/order/delete/${orderId}`,
        {
          headers: { token },
        }
      );
      if (response.data.success) {
        message.success("Order deleted successfully");
        await fetchAllOrder();
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error("Error deleting order");
    } finally {
      setUpdateLoading((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const getStatusBgColor = (status) => {
    const bgColors = {
      "Food Processing": "#e6f7ff",
      "Out for delivery": "#fff7e6",
      Delivered: "#f6ffed",
    };
    return bgColors[status] || "#f5f5f5";
  };

  const columns = [
    {
      title: "Order ID",
      dataIndex: "_id",
      key: "orderId",
      render: (id) => (
        <Text code style={{ fontSize: "12px" }}>
          #{id.slice(-8).toUpperCase()}
        </Text>
      ),
      width: 120,
    },
    {
      title: "Customer",
      key: "customer",
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Space>
            <Avatar size="small" icon={<UserOutlined />} />
            <Text strong>{record.address.name || "N/A"}</Text>
          </Space>
          <Space>
            <PhoneOutlined style={{ color: "#8c8c8c" }} />
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {record.address.phone || "N/A"}
            </Text>
          </Space>
        </Space>
      ),
      width: 200,
    },
    {
      title: "Items",
      key: "items",
      render: (_, record) => (
        <div>
          <Text strong>{record.items.length} items</Text>
          <div style={{ marginTop: "4px" }}>
            {record.items.slice(0, 2).map((item, index) => (
              <Text key={index} style={{ fontSize: "12px", display: "block" }}>
                • {item.name} x{item.quantity}
              </Text>
            ))}
            {record.items.length > 2 && (
              <Text style={{ fontSize: "12px", color: "#8c8c8c" }}>
                +{record.items.length - 2} more
              </Text>
            )}
          </div>
        </div>
      ),
      width: 200,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => (
        <Text strong style={{ color: "#52c41a", fontSize: "16px" }}>
          Rs. {amount}
        </Text>
      ),
      sorter: (a, b) => a.amount - b.amount,
      width: 100,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status, record) => (
        <Select
          value={status}
          onChange={(value) => statusHandler(record._id, value)}
          loading={updateLoading[record._id]}
          style={{
            width: "100%",
            backgroundColor: getStatusBgColor(status),
            borderRadius: "6px",
          }}
          bordered={false}
        >
          <Option value="Food Processing">
            <Tag color="blue" icon={<ClockCircleOutlined />}>
              Food Processing
            </Tag>
          </Option>
          <Option value="Out for delivery">
            <Tag color="orange" icon={<TruckOutlined />}>
              Out for delivery
            </Tag>
          </Option>
          <Option value="Delivered">
            <Tag color="green" icon={<CheckCircleOutlined />}>
              Delivered
            </Tag>
          </Option>
        </Select>
      ),
      width: 180,
    },
    {
      title: "Address",
      key: "address",
      render: (_, record) => {
        const addressParts = [
          record.address.street,
          record.address.city,
          record.address.state,
        ].filter(Boolean);
        const fullAddress = addressParts.join(", ");

        return (
          <Tooltip title={fullAddress || "Address not available"}>
            <Space>
              <EnvironmentOutlined style={{ color: "#8c8c8c" }} />
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {record.address.city || "N/A"}, {record.address.state || "N/A"}
              </Text>
            </Space>
          </Tooltip>
        );
      },
      width: 150,
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "date",
      render: (date) => (
        <Text type="secondary" style={{ fontSize: "12px" }}>
          {new Date(date).toLocaleDateString()}
        </Text>
      ),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      defaultSortOrder: "descend",
      width: 100,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="Are you sure you want to delete this order?"
            description="This action cannot be undone."
            onConfirm={() => deleteOrder(record._id)}
            okText="Yes, Delete"
            cancelText="Cancel"
            okType="danger"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              loading={updateLoading[record._id]}
              size="small"
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
      width: 100,
      fixed: "right",
    },
  ];

  useEffect(() => {
    if (!admin && !token) {
      toast.error("Please Login First");
      navigate("/");
    } else {
      fetchAllOrder();
    }
  }, [admin, token, navigate]);

  const totalOrders = filteredOrders.length;
  const totalRevenue = filteredOrders.reduce(
    (sum, order) => sum + order.amount,
    0
  );
  const processingOrders = filteredOrders.filter(
    (order) => order.status === "Food Processing"
  ).length;
  const outForDeliveryOrders = filteredOrders.filter(
    (order) => order.status === "Out for delivery"
  ).length;
  const deliveredOrders = filteredOrders.filter(
    (order) => order.status === "Delivered"
  ).length;

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Title level={2} style={{ marginBottom: "24px" }}>
        Orders Management
      </Title>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={6} md={6}>
          <Card size="small">
            <Statistic
              title="Total Revenue"
              value={totalRevenue}
              prefix="Rs."
              precision={2}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6} md={6}>
          <Card size="small">
            <Statistic
              title="Total Orders"
              value={totalOrders}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6} md={4}>
          <Card size="small">
            <Statistic
              title="Processing"
              value={processingOrders}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6} md={4}>
          <Card size="small">
            <Statistic
              title="Out for Delivery"
              value={outForDeliveryOrders}
              prefix={<TruckOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6} md={4}>
          <Card size="small">
            <Statistic
              title="Delivered"
              value={deliveredOrders}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Search Bar */}
      <Row style={{ marginBottom: "24px" }}>
        <Col span={24}>
          <Input
            placeholder="Search orders by order ID, customer name, or status..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            size="large"
            style={{ maxWidth: "500px" }}
            allowClear
          />
        </Col>
      </Row>

      {/* Orders Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} orders`,
          }}
          scroll={{ x: 1000 }}
          rowClassName={(record) => {
            const status = record.status;
            return `order-row-${status.toLowerCase().replace(/\s+/g, "-")}`;
          }}
          defaultSortOrder="descend"
          sortDirections={["descend", "ascend"]}
          locale={{
            emptyText: searchText
              ? "No orders match your search"
              : "No orders found",
          }}
        />
      </Card>

      <style>{`
        .order-row-food-processing {
          background-color: #e6f7ff !important;
        }
        .order-row-out-for-delivery {
          background-color: #fff7e6 !important;
        }
        .order-row-delivered {
          background-color: #f6ffed !important;
        }
        .order-row-food-processing:hover {
          background-color: #bae7ff !important;
        }
        .order-row-out-for-delivery:hover {
          background-color: #ffd591 !important;
        }
        .order-row-delivered:hover {
          background-color: #d9f7be !important;
        }
      `}</style>
    </div>
  );
};

export default Orders;

Orders.propTypes = {
  url: PropTypes.string.isRequired,
};
