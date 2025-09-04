import { useContext } from "react";
import {
  Layout,
  Button,
  Space,
  Typography,
  Avatar,
  Dropdown,
  Menu,
} from "antd";
import {
  LogoutOutlined,
  UserOutlined,
  SettingOutlined,
  LoginOutlined,
} from "@ant-design/icons";
import { StoreContext } from "../../context/StoreContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const { Header } = Layout;
const { Text } = Typography;

const Navbar = () => {
  const navigate = useNavigate();
  const { token, admin, setAdmin, setToken } = useContext(StoreContext);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    setToken("");
    setAdmin(false);
    toast.success("Logout Successfully");
    navigate("/");
  };

  const userMenu = (
    <Menu
      items={[
        {
          key: "profile",
          icon: <UserOutlined />,
          label: "Profile",
          onClick: () => {
            // Handle profile navigation
            console.log("Profile clicked");
          },
        },
        {
          key: "settings",
          icon: <SettingOutlined />,
          label: "Settings",
          onClick: () => {
            // Handle settings navigation
            console.log("Settings clicked");
          },
        },
        {
          type: "divider",
        },
        {
          key: "logout",
          icon: <LogoutOutlined />,
          label: "Logout",
          onClick: logout,
          danger: true,
        },
      ]}
    />
  );

  return (
    <Header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        background: "#fff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        height: "64px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <Text
          strong
          style={{
            fontSize: "24px",
            color: "#ff1e01",
            margin: 0,
            cursor: "pointer",
          }}
          onClick={() => navigate("/dashboard")}
        >
          Admin Panel
        </Text>
      </div>

      <Space size="middle">
        {token && admin ? (
          <>
            <Text type="secondary">Welcome, Admin</Text>
            <Dropdown overlay={userMenu} placement="bottomRight" arrow>
              <Button type="text" style={{ padding: "4px 8px" }}>
                <Space>
                  <Avatar
                    size="small"
                    icon={<UserOutlined />}
                    style={{ backgroundColor: "#1890ff" }}
                  />
                  <Text>Admin</Text>
                </Space>
              </Button>
            </Dropdown>
          </>
        ) : (
          <Button
            type="primary"
            icon={<LoginOutlined />}
            onClick={() => navigate("/")}
          >
            Login
          </Button>
        )}
      </Space>
    </Header>
  );
};

export default Navbar;

Navbar.propTypes = {};
