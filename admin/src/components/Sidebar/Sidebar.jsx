import { Layout, Menu, Typography } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import {
  DashboardOutlined,
  BarChartOutlined,
  UnorderedListOutlined,
  ShoppingCartOutlined,
  AppstoreAddOutlined,
  DollarOutlined,
  LineChartOutlined,
} from "@ant-design/icons";

const { Sider } = Layout;
const { Text } = Typography;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
      onClick: () => navigate("/dashboard"),
    },
    {
      key: "analytics",
      icon: <BarChartOutlined />,
      label: "Analytics",
      onClick: () => navigate("/analytics"),
    },
    {
      key: "add",
      icon: <AppstoreAddOutlined />,
      label: "Add Items",
      onClick: () => navigate("/add"),
    },
    {
      key: "list",
      icon: <UnorderedListOutlined />,
      label: "List Items",
      onClick: () => navigate("/list"),
    },
    {
      key: "orders",
      icon: <ShoppingCartOutlined />,
      label: "Orders",
      onClick: () => navigate("/orders"),
    },
    {
      key: "pricing",
      icon: <DollarOutlined />,
      label: "Pricing",
      onClick: () => navigate("/pricing"),
    },
    {
      key: "forecast",
      icon: <LineChartOutlined />,
      label: "Forecast",
      onClick: () => navigate("/forecast"),
    },
  ];

  // Get current selected key based on pathname
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
        top: 64, // Height of navbar
        bottom: 0,
        background: "#fff",
        boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
        zIndex: 999,
      }}
    >
      <div
        style={{
          padding: "24px 16px",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <Text
          strong
          style={{
            fontSize: "16px",
            color: "#1890ff",
          }}
        >
          Food Ordering System
        </Text>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[getSelectedKey()]}
        items={menuItems}
        style={{
          border: "none",
          background: "transparent",
          fontSize: "16px",
        }}
        theme="light"
      />
    </Sider>
  );
};

export default Sidebar;
