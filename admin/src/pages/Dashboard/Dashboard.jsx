import { useState, useEffect, useContext } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Table,
  Tag,
  Space,
  Typography,
  Spin,
} from "antd";
import {
  ShoppingCartOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  RiseOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PropTypes from "prop-types";

const { Title, Text } = Typography;

const Dashboard = ({ url }) => {
  const navigate = useNavigate();
  const { token, admin } = useContext(StoreContext);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalOrders: 0,
    todayOrders: 0,
    weekOrders: 0,
    totalFoodItems: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    weekRevenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    processingOrders: 0,
    outForDelivery: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topSellingItems, setTopSellingItems] = useState([]);

  // Recent orders table columns
  const recentOrdersColumns = [
    {
      title: "Order ID",
      dataIndex: "_id",
      key: "orderId",
      render: (id) => `#${id.slice(-8).toUpperCase()}`,
    },
    {
      title: "Customer",
      key: "customer",
      render: (_, record) =>
        `${record.address.firstName} ${record.address.lastName}`,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => `Rs. ${amount}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const color =
          status === "Delivered"
            ? "green"
            : status === "Food Processing"
            ? "blue"
            : status === "Out for delivery"
            ? "orange"
            : "red";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Time",
      dataIndex: "createdAt",
      key: "time",
      render: (date) => {
        const now = new Date();
        const orderDate = new Date(date);
        const diffInMinutes = Math.floor((now - orderDate) / (1000 * 60));

        if (diffInMinutes < 60) {
          return `${diffInMinutes} min ago`;
        } else if (diffInMinutes < 1440) {
          return `${Math.floor(diffInMinutes / 60)} hour${
            Math.floor(diffInMinutes / 60) > 1 ? "s" : ""
          } ago`;
        } else {
          return `${Math.floor(diffInMinutes / 1440)} day${
            Math.floor(diffInMinutes / 1440) > 1 ? "s" : ""
          } ago`;
        }
      },
    },
  ];

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch orders data
      const ordersResponse = await axios.get(url + "/api/order/list", {
        headers: { token },
      });

      // Fetch food items data
      const foodResponse = await axios.get(url + "/api/food/list");

      if (ordersResponse.data.success && foodResponse.data.success) {
        const orders = ordersResponse.data.data;
        const foodItems = foodResponse.data.data;

        // Calculate dashboard metrics
        const now = new Date();
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        const todayOrders = orders.filter(
          (order) => new Date(order.createdAt) >= today
        );
        const weekOrders = orders.filter(
          (order) => new Date(order.createdAt) >= weekAgo
        );

        const totalRevenue = orders.reduce(
          (sum, order) => sum + order.amount,
          0
        );
        const todayRevenue = todayOrders.reduce(
          (sum, order) => sum + order.amount,
          0
        );
        const weekRevenue = weekOrders.reduce(
          (sum, order) => sum + order.amount,
          0
        );

        const processingOrders = orders.filter(
          (order) => order.status === "Food Processing"
        ).length;
        const outForDelivery = orders.filter(
          (order) => order.status === "Out for delivery"
        ).length;
        const deliveredOrders = orders.filter(
          (order) => order.status === "Delivered"
        ).length;

        // Get recent orders (last 5)
        const recentOrdersData = orders
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);

        // Calculate top selling items
        const itemSales = {};
        orders.forEach((order) => {
          order.items.forEach((item) => {
            if (itemSales[item.name]) {
              itemSales[item.name].sales += item.quantity;
              itemSales[item.name].revenue += item.price * item.quantity;
            } else {
              itemSales[item.name] = {
                name: item.name,
                sales: item.quantity,
                revenue: item.price * item.quantity,
              };
            }
          });
        });

        const topSelling = Object.values(itemSales)
          .sort((a, b) => b.sales - a.sales)
          .slice(0, 5);

        setDashboardData({
          totalOrders: orders.length,
          todayOrders: todayOrders.length,
          weekOrders: weekOrders.length,
          totalFoodItems: foodItems.length,
          totalRevenue,
          todayRevenue,
          weekRevenue,
          pendingOrders: processingOrders,
          deliveredOrders,
          processingOrders,
          outForDelivery,
        });

        setRecentOrders(recentOrdersData);
        setTopSellingItems(topSelling);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Error loading dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!admin && !token) {
      toast.error("Please Login First");
      navigate("/");
    } else {
      fetchDashboardData();
    }
  }, [admin, token, navigate]);

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
        Dashboard Overview
      </Title>

      {/* Main Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Orders"
              value={dashboardData.totalOrders}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Today's Orders"
              value={dashboardData.todayOrders}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={dashboardData.totalRevenue}
              prefix="Rs."
              precision={2}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Food Items"
              value={dashboardData.totalFoodItems}
              prefix={<AppstoreOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Secondary Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="This Week's Orders"
              value={dashboardData.weekOrders}
              prefix={<RiseOutlined />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Today's Revenue"
              value={dashboardData.todayRevenue}
              prefix="Rs."
              precision={2}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pending Orders"
              value={dashboardData.pendingOrders}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Delivered Orders"
              value={dashboardData.deliveredOrders}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Order Status Progress */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} lg={12}>
          <Card title="Order Status Distribution" size="small">
            <Space direction="vertical" style={{ width: "100%" }}>
              <div>
                <Text>Processing</Text>
                <Progress
                  percent={
                    dashboardData.totalOrders > 0
                      ? Math.round(
                          (dashboardData.processingOrders /
                            dashboardData.totalOrders) *
                            100
                        )
                      : 0
                  }
                  status="active"
                  strokeColor="#1890ff"
                />
              </div>
              <div>
                <Text>Out for Delivery</Text>
                <Progress
                  percent={
                    dashboardData.totalOrders > 0
                      ? Math.round(
                          (dashboardData.outForDelivery /
                            dashboardData.totalOrders) *
                            100
                        )
                      : 0
                  }
                  strokeColor="#fa8c16"
                />
              </div>
              <div>
                <Text>Delivered</Text>
                <Progress
                  percent={
                    dashboardData.totalOrders > 0
                      ? Math.round(
                          (dashboardData.deliveredOrders /
                            dashboardData.totalOrders) *
                            100
                        )
                      : 0
                  }
                  strokeColor="#52c41a"
                />
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Top Selling Items" size="small">
            <Space direction="vertical" style={{ width: "100%" }}>
              {topSellingItems.length > 0 ? (
                topSellingItems.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text>{item.name}</Text>
                    <Space>
                      <Text type="secondary">{item.sales} sales</Text>
                      <Text strong>Rs. {item.revenue.toFixed(2)}</Text>
                    </Space>
                  </div>
                ))
              ) : (
                <Text type="secondary">No sales data available</Text>
              )}
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Recent Orders Table */}
      <Card title="Recent Orders" size="small">
        <Table
          columns={recentOrdersColumns}
          dataSource={recentOrders}
          pagination={false}
          size="small"
          rowKey="_id"
        />
      </Card>
    </div>
  );
};

export default Dashboard;

Dashboard.propTypes = {
  url: PropTypes.string.isRequired,
};
