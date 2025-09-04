import { useContext, useEffect, useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Space,
  Divider,
  message,
  Spin,
  Layout,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  LoginOutlined,
  DashboardOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import axios from "axios";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

const { Title, Text } = Typography;
const { Content } = Layout;

const Login = ({ url }) => {
  const navigate = useNavigate();
  const { admin, setAdmin, token, setToken } = useContext(StoreContext);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post(url + "/api/user/login", values);
      if (response.data.success) {
        if (response.data.role === "admin") {
          setToken(response.data.token);
          setAdmin(true);
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("admin", true);
          message.success("Login Successful!");
          navigate("/dashboard");
        } else {
          message.error("You are not an admin");
        }
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error("Login failed. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (admin && token) {
      navigate("/dashboard");
    }
  }, [admin, token, navigate]);
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Content
        style={{
          display: "flex",
          minHeight: "100vh",
        }}
      >
        {/* Left Side - Company Info */}
        <div
          style={{
            flex: 1,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "48px",
            color: "white",
          }}
        >
          <div style={{ textAlign: "center", maxWidth: "500px" }}>
            <div
              style={{
                fontSize: "80px",
                marginBottom: "24px",
              }}
            >
              🍽️
            </div>
            <Title
              level={1}
              style={{
                color: "white",
                marginBottom: "16px",
                fontSize: "48px",
                fontWeight: "bold",
              }}
            >
              Food Ordering System
            </Title>
            <Title
              level={3}
              style={{
                color: "rgba(255,255,255,0.9)",
                marginBottom: "32px",
                fontWeight: "normal",
              }}
            >
              Admin Dashboard
            </Title>
            <div style={{ marginBottom: "48px" }}>
              <Text
                style={{
                  fontSize: "18px",
                  color: "rgba(255,255,255,0.8)",
                  lineHeight: "1.6",
                }}
              >
                Manage your food delivery business with our comprehensive admin
                panel. Track orders, manage inventory, and analyze performance
                metrics all in one place.
              </Text>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                alignItems: "flex-start",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    backgroundColor: "white",
                    borderRadius: "50%",
                  }}
                />
                <Text style={{ color: "rgba(255,255,255,0.9)" }}>
                  Real-time order management
                </Text>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    backgroundColor: "white",
                    borderRadius: "50%",
                  }}
                />
                <Text style={{ color: "rgba(255,255,255,0.9)" }}>
                  Inventory and menu management
                </Text>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    backgroundColor: "white",
                    borderRadius: "50%",
                  }}
                />
                <Text style={{ color: "rgba(255,255,255,0.9)" }}>
                  Analytics and reporting
                </Text>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    backgroundColor: "white",
                    borderRadius: "50%",
                  }}
                />
                <Text style={{ color: "rgba(255,255,255,0.9)" }}>
                  Customer support tools
                </Text>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "48px",
            backgroundColor: "#f8f9fa",
          }}
        >
          <Card
            style={{
              width: "100%",
              maxWidth: "400px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
              borderRadius: "16px",
              border: "none",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <Title level={2} style={{ margin: 0, color: "#1890ff" }}>
                Welcome Back
              </Title>
              <Text type="secondary" style={{ fontSize: "16px" }}>
                Sign in to your admin account
              </Text>
            </div>

            <Form
              form={form}
              name="login"
              onFinish={onFinish}
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Please input your email!" },
                  { type: "email", message: "Please enter a valid email!" },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Email address"
                  style={{ borderRadius: "8px", height: "48px" }}
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "Please input your password!" },
                  {
                    min: 6,
                    message: "Password must be at least 6 characters!",
                  },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Password"
                  style={{ borderRadius: "8px", height: "48px" }}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: "24px" }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<LoginOutlined />}
                  style={{
                    width: "100%",
                    height: "48px",
                    borderRadius: "8px",
                    fontSize: "16px",
                    fontWeight: "500",
                  }}
                >
                  Sign In
                </Button>
              </Form.Item>
            </Form>

            <Divider />

            <div style={{ textAlign: "center" }}>
              <Space direction="vertical" size="small">
                <Text type="secondary" style={{ fontSize: "14px" }}>
                  <DashboardOutlined /> Admin Dashboard Access
                </Text>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  Secure access to your food delivery management system
                </Text>
              </Space>
            </div>
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default Login;

Login.propTypes = {
  url: PropTypes.string.isRequired,
};
