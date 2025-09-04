import { Layout } from "antd";
import Navbar from "./components/Navbar/Navbar";
import Sidebar from "./components/Sidebar/Sidebar";
import { Route, Routes } from "react-router-dom";
import Add from "./pages/Add/Add";
import List from "./pages/List/List";
import Orders from "./pages/Orders/Orders";
import Dashboard from "./pages/Dashboard/Dashboard";
import Analytics from "./pages/Analytics/Analytics";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./components/Login/Login";

const { Content } = Layout;

const App = () => {
  const url = "http://localhost:4000";
  return (
    <>
      <ToastContainer
        autoClose={1000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Routes>
        {/* Login route - standalone page without layout */}
        <Route path="/" element={<Login url={url} />} />

        {/* Admin routes - with navbar and sidebar layout */}
        <Route
          path="/*"
          element={
            <Layout style={{ minHeight: "100vh" }}>
              <Navbar />
              <Layout>
                <Sidebar />
                <Layout>
                  <Content
                    style={{
                      marginLeft: "250px", // Width of sidebar
                      marginTop: "64px", // Height of navbar
                      padding: "24px",
                      background: "#f0f2f5",
                      minHeight: "calc(100vh - 64px)",
                    }}
                  >
                    <Routes>
                      <Route
                        path="/dashboard"
                        element={<Dashboard url={url} />}
                      />
                      <Route
                        path="/analytics"
                        element={<Analytics url={url} />}
                      />
                      <Route path="/add" element={<Add url={url} />} />
                      <Route path="/list" element={<List url={url} />} />
                      <Route path="/orders" element={<Orders url={url} />} />
                    </Routes>
                  </Content>
                </Layout>
              </Layout>
            </Layout>
          }
        />
      </Routes>
    </>
  );
};

export default App;
