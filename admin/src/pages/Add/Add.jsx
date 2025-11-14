import { useState, useContext, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  InputNumber,
  Upload,
  Button,
  Row,
  Col,
  Typography,
  Space,
  message,
  Spin,
  Divider,
} from "antd";
import {
  PlusOutlined,
  InboxOutlined,
  UploadOutlined,
  ClearOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { toast } from "react-toastify";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

const Add = ({ url }) => {
  const navigate = useNavigate();
  const { token, admin } = useContext(StoreContext);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description);
      formData.append("price", values.price);
      formData.append("category", values.category);
      formData.append("image", imageFile);

      const response = await axios.post(`${url}/api/food/add`, formData, {
        headers: { token },
      });

      if (response.data.success) {
        form.resetFields();
        setImageFile(null);
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Error adding food item");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    name: "image",
    accept: "image/*",
    multiple: false,
    beforeUpload: (file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error("You can only upload image files!");
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error("Image must be smaller than 2MB!");
        return false;
      }
      setImageFile(file);
      return false; // Prevent auto upload
    },
    onRemove: () => {
      setImageFile(null);
    },
    showUploadList: {
      showPreviewIcon: false,
      showRemoveIcon: true,
    },
  };

  useEffect(() => {
    if (!admin && !token) {
      toast.error("Please Login First");
      navigate("/");
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
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <Card
        style={{
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
          border: "none",
        }}
      >
        <div style={{ marginBottom: "32px", textAlign: "center" }}>
          <Title
            level={2}
            style={{
              marginBottom: "8px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: 700,
            }}
          >
            Add New Food Item
          </Title>
          <Text type="secondary" style={{ fontSize: "16px" }}>
            Fill in the details below to add a new item to the menu
          </Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{}}
          size="large"
        >
          <Row gutter={[32, 24]}>
            <Col xs={24} lg={12}>
              <Card
                style={{
                  borderRadius: "8px",
                  border: "2px dashed #d9d9d9",
                  backgroundColor: "#fafafa",
                }}
              >
                <Form.Item
                  label={
                    <Text strong style={{ fontSize: "16px" }}>
                      Food Image
                      <Text type="danger"> *</Text>
                    </Text>
                  }
                  required
                  tooltip="Upload a high-quality image for the food item"
                >
                  <Dragger
                    {...uploadProps}
                    style={{
                      height: "280px",
                      borderRadius: "8px",
                      backgroundColor: "#fff",
                    }}
                  >
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined
                        style={{
                          fontSize: "64px",
                          background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      />
                    </p>
                    <p
                      className="ant-upload-text"
                      style={{
                        fontSize: "16px",
                        fontWeight: 600,
                        color: "#262626",
                        marginBottom: "8px",
                      }}
                    >
                      Click or drag image to upload
                    </p>
                    <p
                      className="ant-upload-hint"
                      style={{ color: "#8c8c8c", fontSize: "14px" }}
                    >
                      Support for JPG, PNG, GIF. Max size: 2MB
                    </p>
                  </Dragger>
                  {imageFile && (
                    <div
                      style={{
                        marginTop: "16px",
                        padding: "12px",
                        backgroundColor: "#f0f9ff",
                        borderRadius: "6px",
                        border: "1px solid #91caff",
                      }}
                    >
                      <Space>
                        <UploadOutlined style={{ color: "#1890ff" }} />
                        <Text strong>{imageFile.name}</Text>
                        <Text type="secondary">
                          ({(imageFile.size / 1024).toFixed(2)} KB)
                        </Text>
                      </Space>
                    </div>
                  )}
                </Form.Item>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Space
                direction="vertical"
                style={{ width: "100%" }}
                size="large"
              >
                <Form.Item
                  label={
                    <Text strong style={{ fontSize: "16px" }}>
                      Food Name
                      <Text type="danger"> *</Text>
                    </Text>
                  }
                  name="name"
                  rules={[
                    { required: true, message: "Please enter food name" },
                    { min: 2, message: "Name must be at least 2 characters" },
                  ]}
                >
                  <Input
                    placeholder="e.g., Margherita Pizza"
                    prefix={<PlusOutlined style={{ color: "#667eea" }} />}
                    style={{
                      borderRadius: "8px",
                      padding: "8px 12px",
                    }}
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <Text strong style={{ fontSize: "16px" }}>
                      Category
                      <Text type="danger"> *</Text>
                    </Text>
                  }
                  name="category"
                  normalize={(value) => value && value.trim()}
                  rules={[
                    {
                      validator: (_, value) => {
                        if (!value || value.trim().length === 0) {
                          return Promise.reject(
                            new Error("Please enter category")
                          );
                        }
                        if (value.trim().length < 2) {
                          return Promise.reject(
                            new Error("Category must be at least 2 characters")
                          );
                        }
                        if (value.trim().length > 50) {
                          return Promise.reject(
                            new Error("Category must not exceed 50 characters")
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input
                    placeholder="e.g., Pizza, Burger, Momo"
                    allowClear
                    style={{
                      borderRadius: "8px",
                      padding: "8px 12px",
                    }}
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <Text strong style={{ fontSize: "16px" }}>
                      Price (Rs.)
                      <Text type="danger"> *</Text>
                    </Text>
                  }
                  name="price"
                  rules={[
                    { required: true, message: "Please enter price" },
                    {
                      type: "number",
                      min: 1,
                      message: "Price must be at least Rs. 1",
                    },
                    {
                      validator: (_, value) => {
                        if (value && (value < 1 || value > 10000)) {
                          return Promise.reject(
                            new Error(
                              "Price must be between Rs. 1 and Rs. 10,000"
                            )
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <InputNumber
                    style={{
                      width: "100%",
                      borderRadius: "8px",
                    }}
                    placeholder="Enter price"
                    prefix="Rs."
                    min={1}
                    max={10000}
                    precision={2}
                    formatter={(value) =>
                      `Rs. ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => value.replace(/Rs.\s?|(,*)/g, "")}
                  />
                </Form.Item>
              </Space>
            </Col>
          </Row>

          <Divider style={{ margin: "32px 0" }} />

          <Form.Item
            label={
              <Text strong style={{ fontSize: "16px" }}>
                Description
                <Text type="danger"> *</Text>
              </Text>
            }
            name="description"
            rules={[
              { required: true, message: "Please enter description" },
              {
                min: 10,
                message: "Description must be at least 10 characters",
              },
            ]}
          >
            <TextArea
              rows={5}
              placeholder="Describe the food item in detail (e.g., ingredients, taste, serving size...)"
              showCount
              maxLength={500}
              style={{
                borderRadius: "8px",
                fontSize: "15px",
              }}
            />
          </Form.Item>

          <Divider style={{ margin: "32px 0" }} />

          <Form.Item style={{ textAlign: "center", marginTop: "24px" }}>
            <Space size="large">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                icon={<SaveOutlined />}
                loading={loading}
                style={{
                  minWidth: "160px",
                  height: "48px",
                  borderRadius: "8px",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "none",
                  fontSize: "16px",
                  fontWeight: 600,
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
                }}
              >
                {loading ? "Adding..." : "Add Food Item"}
              </Button>
              <Button
                size="large"
                icon={<ClearOutlined />}
                onClick={() => {
                  form.resetFields();
                  setImageFile(null);
                }}
                style={{
                  minWidth: "160px",
                  height: "48px",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: 500,
                }}
              >
                Reset Form
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Add;

Add.propTypes = {
  url: PropTypes.string.isRequired,
};
