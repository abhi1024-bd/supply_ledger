import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import { AuthContext } from "../context/AuthContext";
import { Search, Download, Eye, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { orders as ordersAPI } from "../services/api";

function OrdersList() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    if (authLoading || !user?.id) return;
    fetchOrders();
  }, [user?.id, authLoading]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await ordersAPI.list(user.id);
      setOrders(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.destination.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const badgeClasses = {
      "Pending": "bg-warning text-dark",
      "In Transit": "bg-info text-white",
      "Delivered": "bg-success text-white",
      "Cancelled": "bg-danger text-white",
    };
    return badgeClasses[status] || "bg-secondary";
  };

  const getPriorityBadge = (priority) => {
    const badgeClasses = {
      "low": "bg-light text-dark",
      "medium": "bg-info text-white",
      "high": "bg-warning text-dark",
      "critical": "bg-danger text-white",
    };
    return badgeClasses[priority] || "bg-secondary";
  };

  const handleDelete = async (orderId) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await ordersAPI.delete(orderId);
        setOrders(orders.filter(o => o.order_id !== orderId));
        toast.success("Order deleted successfully");
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const exportToCSV = () => {
    const csv = [
      ["Order ID", "Status", "Origin", "Destination", "Weight", "Priority", "Value", "Date"],
      ...filteredOrders.map(o => [
        o.order_id,
        o.status,
        o.origin,
        o.destination,
        o.weight,
        o.priority,
        o.value,
        new Date(o.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orders.csv";
    a.click();
  };

  if (authLoading || loading) {
    return (
      <div className="bg-light min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <div className="bg-light min-vh-100 py-5">
        <div className="container-fluid py-5">
          <div className="mx-auto" style={{ maxWidth: "1400px" }}>
          <div className="mb-5">
            <h1 className="display-4 fw-bold mb-2">Orders & Tracking</h1>
            <p className="lead text-muted">Manage and track all your shipments</p>
          </div>

          {/* Filters */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="input-group input-group-lg">
                    <span className="input-group-text bg-white border-end-0">
                      <Search size={20} />
                    </span>
                    <input
                      type="text"
                      placeholder="Search by Order ID or Destination..."
                      className="form-control border-start-0"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <select
                    className="form-select form-select-lg"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <button
                    onClick={exportToCSV}
                    className="btn btn-outline-primary btn-lg w-100"
                  >
                    <Download size={20} className="me-2" style={{ display: "inline" }} />
                    Export
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="card border-0 shadow-sm">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Order ID</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Weight</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Value</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <tr key={order.order_id}>
                        <td className="fw-semibold font-monospace">{order.order_id}</td>
                        <td>{order.origin}</td>
                        <td>{order.destination}</td>
                        <td>{order.weight} kg</td>
                        <td>
                          <span className={`badge ${getStatusBadge(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${getPriorityBadge(order.priority)}`}>
                            {order.priority}
                          </span>
                        </td>
                        <td>${order.value.toFixed(2)}</td>
                        <td className="text-muted">{new Date(order.created_at).toLocaleDateString()}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-primary me-2"
                            onClick={() => navigate(`/order/${order.order_id}`)}
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(order.order_id)}
                            title="Delete Order"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="text-center py-5 text-muted">
                        No orders found. Try adjusting your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="card-footer bg-light p-4">
              <small className="text-muted">
                Showing {filteredOrders.length} of {orders.length} orders
              </small>
            </div>
          </div>

          {/* Stats */}
          <div className="row g-4 mt-5">
            <div className="col-md-3">
              <div className="card border-0 shadow-sm text-center">
                <div className="card-body">
                  <div className="h3 fw-bold text-primary mb-2">
                    {orders.filter(o => o.status === "Delivered").length}
                  </div>
                  <small className="text-muted">Delivered</small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm text-center">
                <div className="card-body">
                  <div className="h3 fw-bold text-info mb-2">
                    {orders.filter(o => o.status === "In Transit").length}
                  </div>
                  <small className="text-muted">In Transit</small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm text-center">
                <div className="card-body">
                  <div className="h3 fw-bold text-warning mb-2">
                    {orders.filter(o => o.status === "Pending").length}
                  </div>
                  <small className="text-muted">Pending</small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm text-center">
                <div className="card-body">
                  <div className="h3 fw-bold text-success mb-2">
                    ${orders.reduce((sum, o) => sum + o.value, 0).toFixed(2)}
                  </div>
                  <small className="text-muted">Total Value</small>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default OrdersList;
