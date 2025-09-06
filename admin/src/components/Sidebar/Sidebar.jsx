import { Layout, Menu, Typography, Divider } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import {
  DashboardOutlined,
  BarChartOutlined,
  UnorderedListOutlined,
  ShoppingCartOutlined,
  AppstoreAddOutlined,
  DollarOutlined,
  LineChartOutlined,
  FireOutlined,
} from "@ant-design/icons";

const { Sider } = Layout;
const { Text } = Typography;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined style={{ fontSize: "18px" }} />,
      label: "Dashboard",
      onClick: () => navigate("/dashboard"),
    },
    {
      key: "analytics",
      icon: <BarChartOutlined style={{ fontSize: "18px" }} />,
      label: "Analytics",
      onClick: () => navigate("/analytics"),
    },
    {
      key: "add",
      icon: <AppstoreAddOutlined style={{ fontSize: "18px" }} />,
      label: "Add Items",
      onClick: () => navigate("/add"),
    },
    {
      key: "list",
      icon: <UnorderedListOutlined style={{ fontSize: "18px" }} />,
      label: "List Items",
      onClick: () => navigate("/list"),
    },
    {
      key: "orders",
      icon: <ShoppingCartOutlined style={{ fontSize: "18px" }} />,
      label: "Orders",
      onClick: () => navigate("/orders"),
    },
    {
      key: "pricing",
      icon: <DollarOutlined style={{ fontSize: "18px" }} />,
      label: "Pricing",
      onClick: () => navigate("/pricing"),
    },
    {
      key: "forecast",
      icon: <LineChartOutlined style={{ fontSize: "18px" }} />,
      label: "Forecast",
      onClick: () => navigate("/forecast"),
    },
  ];

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.includes("/dashboard")) return "dashboard";
    if (path.includes("/analytics")) return "analytics";
    if (path.includes("/add")) return "add";
    if (path.includes("/list")) return "list";
    if (path.includes("/orders")) return "orders";
    if (path.includes("/pricing")) return "pricing";
    if (path.includes("/forecast")) return "forecast";
    return "dashboard";
  };

  return (
    <Sider
      width={250}
      style={{
        position: "fixed",
        left: 0,
        top: 64,
        bottom: 0,
        background: "#fff",
        boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          padding: "24px 20px",
          textAlign: "center",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <div
          style={{
            width: "50px",
            height: "50px",
            background: "#ff1e01",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 12px",
          }}
        >
          <FireOutlined style={{ fontSize: "24px", color: "#fff" }} />
        </div>
        <Text
          strong
          style={{
            fontSize: "16px",
            color: "#ff1e01",
            display: "block",
            marginBottom: "2px",
          }}
        >
          FoodAdmin
        </Text>
        <Text
          style={{
            fontSize: "11px",
            color: "#666",
          }}
        >
          Management System
        </Text>
      </div>

      <Menu
        mode="inline"
        selectedKeys={[getSelectedKey()]}
        items={menuItems}
        style={{
          border: "none",
          background: "transparent",
          fontSize: "15px",
          padding: "8px 0",
        }}
        theme="light"
      />

      <Divider style={{ margin: "16px 0" }} />

      <div style={{ padding: "0 20px" }}>
        <Menu
          mode="inline"
          style={{
            border: "none",
            background: "transparent",
            fontSize: "14px",
          }}
          theme="light"
        />
      </div>
    </Sider>
  );
};

export default Sidebar;
