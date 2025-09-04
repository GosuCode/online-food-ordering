import { useEffect, useState, useContext } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Typography,
  Image,
  Tag,
  Popconfirm,
  message,
  Spin,
  Row,
  Col,
  Statistic,
  Empty,
  Input,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  AppstoreOutlined,
  DollarOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { toast } from "react-toastify";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

const { Title, Text } = Typography;

const List = ({ url }) => {
  const navigate = useNavigate();
  const { token, admin } = useContext(StoreContext);
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState({});
  const [searchText, setSearchText] = useState("");

  const fetchList = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${url}/api/food/list`);
      if (response.data.success) {
        setList(response.data.data);
        setFilteredList(response.data.data);
      } else {
        toast.error("Failed to fetch food items");
      }
    } catch (error) {
      toast.error("Error fetching food items");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
    if (!value.trim()) {
      setFilteredList(list);
      return;
    }

    const filtered = list.filter(
      (item) =>
        item.name.toLowerCase().includes(value.toLowerCase()) ||
        item.category.toLowerCase().includes(value.toLowerCase()) ||
        item.description.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredList(filtered);
  };

  const removeFood = async (foodId) => {
    setDeleteLoading((prev) => ({ ...prev, [foodId]: true }));
    try {
      const response = await axios.post(
        `${url}/api/food/remove`,
        { id: foodId },
        { headers: { token } }
      );

      if (response.data.success) {
        message.success(response.data.message);
        await fetchList();
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error("Error deleting food item");
      console.error(error);
    } finally {
      setDeleteLoading((prev) => ({ ...prev, [foodId]: false }));
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      Salad: "green",
      Rolls: "blue",
      Deserts: "purple",
      Sandwich: "orange",
      Cake: "pink",
      "Pure Veg": "green",
      Pasta: "cyan",
      Noodles: "volcano",
    };
    return colors[category] || "default";
  };

  const columns = [
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      width: 100,
      render: (image) => (
        <Image
          src={`${url}/images/${image}`}
          alt="Food item"
          width={60}
          height={60}
          style={{ borderRadius: "8px", objectFit: "cover" }}
        />
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (category) => (
        <Tag color={getCategoryColor(category)}>{category}</Tag>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) => (
        <Text strong style={{ color: "#52c41a" }}>
          Rs. {price}
        </Text>
      ),
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      width: 200,
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            size="small"
            title="View details"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            title="Edit item"
          />
          <Popconfirm
            title="Delete Food Item"
            description="Are you sure you want to delete this food item?"
            onConfirm={() => removeFood(record._id)}
            okText="Yes"
            cancelText="No"
            okType="danger"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
              loading={deleteLoading[record._id]}
              title="Delete item"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    if (!admin && !token) {
      toast.error("Please Login First");
      navigate("/");
    } else {
      fetchList();
    }
  }, [admin, token, navigate]);

  const totalValue = filteredList.reduce((sum, item) => sum + item.price, 0);

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
        <Title level={2} style={{ marginBottom: "24px" }}>
          Food Items Management
        </Title>

        {/* Search Bar */}
        <Row style={{ marginBottom: "24px" }}>
          <Col span={24}>
            <Input
              placeholder="Search food items by name, category, or description..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              size="large"
              style={{ maxWidth: "500px" }}
              allowClear
            />
          </Col>
        </Row>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col xs={24} sm={8}>
            <Card size="small">
              <Statistic
                title="Total Items"
                value={filteredList.length}
                prefix={<AppstoreOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card size="small">
              <Statistic
                title="Total Value"
                value={totalValue}
                prefix={<DollarOutlined />}
                precision={2}
                valueStyle={{ color: "#52c41a" }}
                suffix="Rs."
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card size="small">
              <Statistic
                title="Categories"
                value={new Set(filteredList.map((item) => item.category)).size}
                valueStyle={{ color: "#722ed1" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Food Items Table */}
        <Table
          columns={columns}
          dataSource={filteredList}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
          }}
          scroll={{ x: 800 }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  searchText
                    ? "No food items match your search"
                    : "No food items found"
                }
              />
            ),
          }}
        />
      </Card>
    </div>
  );
};

export default List;

List.propTypes = {
  url: PropTypes.string.isRequired,
};
