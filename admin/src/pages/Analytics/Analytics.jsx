import { useState, useEffect, useContext } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Spin,
  Select,
  DatePicker,
  Space,
  Statistic,
} from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { ShoppingCartOutlined, ClockCircleOutlined } from "@ant-design/icons";
import axios from "axios";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const Analytics = ({ url }) => {
  const navigate = useNavigate();
  const { token, admin } = useContext(StoreContext);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, "day"),
    dayjs(),
  ]);
  const [timeFrame, setTimeFrame] = useState("30days");

  // Data states
  const [ordersData, setOrdersData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  // Colors for charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  const fetchAnalyticsData = async () => {
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

        // Filter orders by date range
        const startDate = dateRange[0].startOf("day").toDate();
        const endDate = dateRange[1].endOf("day").toDate();
        const filteredOrders = orders.filter(
          (order) =>
            new Date(order.createdAt) >= startDate &&
            new Date(order.createdAt) <= endDate
        );

        // Process data for different charts
        processOrdersData(filteredOrders);
        processRevenueData(filteredOrders);
        processOrderStatusData(filteredOrders);
        processHourlyData(filteredOrders);
        processCategoryData(foodItems, filteredOrders);
      }
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      toast.error("Error loading analytics data");
    } finally {
      setLoading(false);
    }
  };

  const processOrdersData = (orders) => {
    const ordersByDate = {};
    const startDate = dateRange[0];
    const endDate = dateRange[1];
    const daysDiff = endDate.diff(startDate, "day");

    // Initialize all dates in range
    for (let i = 0; i <= daysDiff; i++) {
      const date = startDate.add(i, "day");
      const dateStr = date.format("MMM DD");
      ordersByDate[dateStr] = { date: dateStr, orders: 0, revenue: 0 };
    }

    // Count orders by date
    orders.forEach((order) => {
      const orderDate = dayjs(order.createdAt);
      const dateStr = orderDate.format("MMM DD");
      if (ordersByDate[dateStr]) {
        ordersByDate[dateStr].orders += 1;
        ordersByDate[dateStr].revenue += order.amount;
      }
    });

    setOrdersData(Object.values(ordersByDate));
  };

  const processRevenueData = (orders) => {
    const revenueByDate = {};
    const startDate = dateRange[0];
    const endDate = dateRange[1];
    const daysDiff = endDate.diff(startDate, "day");

    // Initialize all dates in range
    for (let i = 0; i <= daysDiff; i++) {
      const date = startDate.add(i, "day");
      const dateStr = date.format("MMM DD");
      revenueByDate[dateStr] = { date: dateStr, revenue: 0, orders: 0 };
    }

    // Calculate revenue by date
    orders.forEach((order) => {
      const orderDate = dayjs(order.createdAt);
      const dateStr = orderDate.format("MMM DD");
      if (revenueByDate[dateStr]) {
        revenueByDate[dateStr].revenue += order.amount;
        revenueByDate[dateStr].orders += 1;
      }
    });

    setRevenueData(Object.values(revenueByDate));
  };

  const processOrderStatusData = (orders) => {
    const statusCounts = {
      placed: 0,
      confirmed: 0,
      preparing: 0,
      out_for_delivery: 0,
      delivered: 0,
    };

    orders.forEach((order) => {
      if (order.status in statusCounts) {
        statusCounts[order.status]++;
      }
    });

    const data = Object.entries(statusCounts)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({
        name: name.replace("_", " ").toUpperCase(),
        value,
      }));

    setOrderStatusData(data);
  };

  const processHourlyData = (orders) => {
    const hourlyCounts = {};
    for (let i = 0; i < 24; i++) {
      hourlyCounts[i] = { hour: `${i}:00`, orders: 0 };
    }

    orders.forEach((order) => {
      const hour = new Date(order.createdAt).getHours();
      if (hourlyCounts[hour]) {
        hourlyCounts[hour].orders += 1;
      }
    });

    setHourlyData(Object.values(hourlyCounts));
  };

  const processCategoryData = (foodItems, orders) => {
    const categoryStats = {};

    // Initialize categories from food items
    foodItems.forEach((item) => {
      if (!categoryStats[item.category]) {
        categoryStats[item.category] = {
          name: item.category,
          items: 0,
          orders: 0,
          revenue: 0,
        };
      }
      categoryStats[item.category].items += 1;
    });

    // Count orders and revenue by category
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const category = foodItems.find(
          (food) => food.name === item.name
        )?.category;
        if (category && categoryStats[category]) {
          categoryStats[category].orders += item.quantity;
          categoryStats[category].revenue += item.price * item.quantity;
        }
      });
    });

    // Filter out categories with no orders and format names
    const filteredData = Object.values(categoryStats)
      .filter((category) => category.orders > 0)
      .map((category) => ({
        ...category,
        name: category.name.replace("_", " ").toUpperCase(),
        avgOrderValue:
          category.orders > 0 ? category.revenue / category.orders : 0,
      }));

    setCategoryData(filteredData);
  };

  useEffect(() => {
    if (!admin && !token) {
      toast.error("Please Login First");
      navigate("/");
    } else {
      fetchAnalyticsData();
    }
  }, [admin, token, navigate, dateRange]);

  const handleDateRangeChange = (dates) => {
    if (dates) {
      setDateRange(dates);
    }
  };

  const handleTimeFrameChange = (value) => {
    setTimeFrame(value);
    const now = dayjs();
    switch (value) {
      case "7days":
        setDateRange([now.subtract(7, "day"), now]);
        break;
      case "30days":
        setDateRange([now.subtract(30, "day"), now]);
        break;
      case "90days":
        setDateRange([now.subtract(90, "day"), now]);
        break;
      default:
        setDateRange([now.subtract(30, "day"), now]);
    }
  };

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
        Analytics Dashboard
      </Title>

      {/* Controls */}
      <Card style={{ marginBottom: "24px" }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Space direction="vertical" size="small">
              <Text strong>Time Frame</Text>
              <Select
                value={timeFrame}
                onChange={handleTimeFrameChange}
                style={{ width: "100%" }}
              >
                <Option value="7days">Last 7 Days</Option>
                <Option value="30days">Last 30 Days</Option>
                <Option value="90days">Last 90 Days</Option>
                <Option value="custom">Custom Range</Option>
              </Select>
            </Space>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Space direction="vertical" size="small">
              <Text strong>Date Range</Text>
              <RangePicker
                value={dateRange}
                onChange={handleDateRangeChange}
                style={{ width: "100%" }}
              />
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Key Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Orders"
              value={ordersData.reduce((sum, item) => sum + item.orders, 0)}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={revenueData.reduce((sum, item) => sum + item.revenue, 0)}
              prefix="Rs."
              precision={2}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Avg Order Value"
              value={
                ordersData.length > 0
                  ? revenueData.reduce((sum, item) => sum + item.revenue, 0) /
                    ordersData.reduce((sum, item) => sum + item.orders, 0)
                  : 0
              }
              prefix="Rs."
              precision={2}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Peak Hour"
              value={
                hourlyData.length > 0
                  ? hourlyData.reduce((max, item) =>
                      item.orders > max.orders ? item : max
                    ).hour
                  : "N/A"
              }
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Row 1 */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} lg={12}>
          <Card title="Orders Over Time" size="small">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={ordersData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="orders"
                  stroke="#1890ff"
                  fill="#1890ff"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Revenue Over Time" size="small">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`Rs. ${value}`, "Revenue"]} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#52c41a"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Charts Row 2 */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} lg={8}>
          <Card title="Order Status Distribution" size="small">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Orders by Hour" size="small">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="#722ed1" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Average Order Value by Category" size="small">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [
                    `Rs. ${value.toFixed(0)}`,
                    "Avg Value",
                  ]}
                />
                <Bar
                  dataKey="avgOrderValue"
                  fill="#fa8c16"
                  name="Average Order Value (Rs.)"
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Charts Row 3 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Category Performance" size="small">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="orders"
                  fill="#1890ff"
                  name="Orders"
                />
                <Bar
                  yAxisId="right"
                  dataKey="revenue"
                  fill="#52c41a"
                  name="Revenue (Rs.)"
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Revenue vs Orders Correlation" size="small">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="orders"
                  fill="#1890ff"
                  name="Orders"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#52c41a"
                  strokeWidth={2}
                  name="Revenue (Rs.)"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Analytics;

Analytics.propTypes = {
  url: PropTypes.string.isRequired,
};
