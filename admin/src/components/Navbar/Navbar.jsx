import { useContext } from "react";
import {
  Layout,
  Button,
  Space,
  Typography,
  Avatar,
  Dropdown,
  Menu,
  Badge,
} from "antd";
import {
  LogoutOutlined,
  UserOutlined,
  SettingOutlined,
  LoginOutlined,
  BellOutlined,
  MenuOutlined,
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
        // {
        //   key: "profile",
        //   icon: <UserOutlined />,
        //   label: "Profile",
        //   onClick: () => console.log("Profile clicked"),
        // },
        // {
        //   key: "settings",
        //   icon: <SettingOutlined />,
        //   label: "Settings",
        //   onClick: () => console.log("Settings clicked"),
        // },
        // {
        //   type: "divider",
        // },
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
        padding: "0 32px",
        background: "#fff",
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        height: "70px",
        backdropFilter: "blur(10px)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <Text
          strong
          style={{
            fontSize: "28px",
            color: "#ff1e01",
            margin: 0,
            cursor: "pointer",
            textShadow: "0 2px 4px rgba(0,0,0,0.3)",
          }}
          onClick={() => navigate("/dashboard")}
        >
          🍕 FoodAdmin
        </Text>
      </div>

      <Space size="large">
        {token && admin ? (
          <>
            <Text style={{ color: "#ff1e01" }}>Welcome back, Admin</Text>
            <Dropdown overlay={userMenu} placement="bottomRight" arrow>
              <Button
                type="text"
                style={{
                  padding: "8px 16px",
                  borderRadius: "20px",
                  background: "#fff",
                  border: "1px solid #ff1e01",
                }}
              >
                <Space>
                  <Avatar
                    size="small"
                    icon={<UserOutlined />}
                    style={{ backgroundColor: "#ff1e01" }}
                  />
                  <Text style={{ color: "#ff1e01" }}>Admin</Text>
                </Space>
              </Button>
            </Dropdown>
          </>
        ) : (
          <Button
            type="primary"
            icon={<LoginOutlined />}
            onClick={() => navigate("/")}
            style={{
              borderRadius: "20px",
              height: "40px",
              padding: "0 24px",
              background: "#ff1e01",
              border: "none",
              boxShadow: "0 4px 15px rgba(255,107,107,0.4)",
            }}
          >
            Login
          </Button>
        )}
      </Space>
    </Header>
  );
};

export default Navbar;
