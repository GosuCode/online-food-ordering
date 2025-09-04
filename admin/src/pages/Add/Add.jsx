import { useState, useContext, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Select,
  InputNumber,
  Upload,
  Button,
  Row,
  Col,
  Typography,
  Space,
  message,
  Spin,
} from "antd";
import { PlusOutlined, InboxOutlined } from "@ant-design/icons";
import axios from "axios";
import { toast } from "react-toastify";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Dragger } = Upload;

const Add = ({ url }) => {
  const navigate = useNavigate();
  const { token, admin } = useContext(StoreContext);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const categories = [
    { value: "Salad", label: "Salad" },
    { value: "Rolls", label: "Rolls" },
    { value: "Deserts", label: "Desserts" },
    { value: "Sandwich", label: "Sandwich" },
    { value: "Cake", label: "Cake" },
    { value: "Pure Veg", label: "Pure Veg" },
    { value: "Pasta", label: "Pasta" },
    { value: "Noodles", label: "Noodles" },
  ];

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
    <div>
      <Card>
        <Title level={2} style={{ marginBottom: "24px", textAlign: "center" }}>
          Add New Food Item
        </Title>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ category: "Salad" }}
          size="large"
        >
          <Row gutter={[24, 16]}>
            <Col xs={24} lg={12}>
              <Form.Item
                label="Food Image"
                required
                tooltip="Upload an image for the food item"
              >
                <Dragger {...uploadProps} style={{ height: "200px" }}>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined
                      style={{ fontSize: "48px", color: "#1890ff" }}
                    />
                  </p>
                  <p className="ant-upload-text">
                    Click or drag image file to this area to upload
                  </p>
                  <p className="ant-upload-hint">
                    Support for single image upload. Max size: 2MB
                  </p>
                </Dragger>
              </Form.Item>
            </Col>

            <Col xs={24} lg={12}>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Form.Item
                  label="Food Name"
                  name="name"
                  rules={[
                    { required: true, message: "Please enter food name" },
                    { min: 2, message: "Name must be at least 2 characters" },
                  ]}
                >
                  <Input
                    placeholder="Enter food name"
                    prefix={<PlusOutlined />}
                  />
                </Form.Item>

                <Form.Item
                  label="Category"
                  name="category"
                  rules={[
                    { required: true, message: "Please select category" },
                  ]}
                >
                  <Select placeholder="Select category">
                    {categories.map((category) => (
                      <Option key={category.value} value={category.value}>
                        {category.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Price"
                  name="price"
                  rules={[
                    { required: true, message: "Please enter price" },
                    {
                      type: "number",
                      min: 0,
                      message: "Price must be positive",
                    },
                  ]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    placeholder="Enter price"
                    prefix="Rs."
                    min={0}
                    precision={2}
                  />
                </Form.Item>
              </Space>
            </Col>
          </Row>

          <Form.Item
            label="Description"
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
              rows={4}
              placeholder="Enter food description"
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item style={{ textAlign: "center", marginTop: "32px" }}>
            <Space size="large">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                icon={<PlusOutlined />}
                loading={loading}
                style={{ minWidth: "120px" }}
              >
                Add Food Item
              </Button>
              <Button
                size="large"
                onClick={() => form.resetFields()}
                style={{ minWidth: "120px" }}
              >
                Reset
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
