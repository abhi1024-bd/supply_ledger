import { useContext, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import { OrderContext } from "../context/OrderContext";
import { ArrowLeft, MapPin, Calendar, Weight, DollarSign, Zap, Package, X } from "lucide-react";
import toast from "react-hot-toast";
import { orders as ordersAPI } from "../services/api";

function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const context = useContext(OrderContext);
  const { getOrderById } = context || {};
  const order = getOrderById ? getOrderById(orderId) : null;
  const [canceling, setCanceling] = useState(false);

  if (!order) {
    return (
      <div className="min-vh-100 bg-light">
        <Navigation />
        <div className="container py-5">
          <button
            className="btn btn-link text-dark mb-3"
            onClick={() => navigate("/orders")}
          >
            <ArrowLeft size={20} className="me-2" style={{ display: "inline" }} />
            Back to Orders
          </button>
          <div className="alert alert-warning">Order not found</div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      Delivered: "#28a745",
      "In Transit": "#ffc107",
      Pending: "#6c757d",
      Critical: "#dc3545",
    };
    return colors[status] || "#6c757d";
  };

  const getPriorityBadge = (priority) => {
    const badgeClass = {
      critical: "bg-danger",
      high: "bg-warning",
      medium: "bg-info",
      low: "bg-secondary",
    };
    return badgeClass[priority] || "bg-secondary";
  };

  const handleCancelOrder = async () => {
    if (window.confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
      try {
        setCanceling(true);
        await ordersAPI.cancel(order.order_id || order.id);
        toast.success("Order cancelled successfully");
        setTimeout(() => window.location.reload(), 1500);
      } catch (error) {
        toast.error(error.message || "Failed to cancel order");
      } finally {
        setCanceling(false);
      }
    }
  };

  return (
    <div className="min-vh-100 bg-light py-5">
      <Navigation />

      <div className="container-fluid py-5">
        <div className="mx-auto" style={{ maxWidth: "1400px" }}>
          <button
          className="btn btn-link text-dark mb-3"
          onClick={() => navigate("/orders")}
        >
          <ArrowLeft size={20} className="me-2" style={{ display: "inline" }} />
          Back to Orders
        </button>

        <div className="row">
          <div className="col-lg-8">
            {/* Order Header */}
            <div className="card mb-4 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h2 className="card-title mb-1">{order.id}</h2>
                    <small className="text-muted">Order Date: {order.date}</small>
                  </div>
                  <div>
                    <span
                      className="badge p-2"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <h6 className="text-muted mb-2">
                      <MapPin size={16} className="me-2" style={{ display: "inline" }} />
                      Origin
                    </h6>
                    <p className="fs-5 fw-bold">{order.origin}</p>
                  </div>
                  <div className="col-md-6">
                    <h6 className="text-muted mb-2">
                      <MapPin size={16} className="me-2" style={{ display: "inline" }} />
                      Destination
                    </h6>
                    <p className="fs-5 fw-bold">{order.destination}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div className="card mb-4 shadow-sm">
              <div className="card-header bg-light">
                <h5 className="card-title mb-0">Order Details</h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <h6 className="text-muted mb-2">
                        <Weight size={16} className="me-2" style={{ display: "inline" }} />
                        Weight
                      </h6>
                      <p className="fw-bold">{order.weight} kg</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <h6 className="text-muted mb-2">
                        <DollarSign size={16} className="me-2" style={{ display: "inline" }} />
                        Value
                      </h6>
                      <p className="fw-bold">${order.value.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <h6 className="text-muted mb-2">
                        <Zap size={16} className="me-2" style={{ display: "inline" }} />
                        Priority
                      </h6>
                      <span className={`badge ${getPriorityBadge(order.priority)}`}>
                        {order.priority.charAt(0).toUpperCase() + order.priority.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <h6 className="text-muted mb-2">
                        <Calendar size={16} className="me-2" style={{ display: "inline" }} />
                        Order Date
                      </h6>
                      <p className="fw-bold">{order.date}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tracking Timeline */}
            <div className="card shadow-sm">
              <div className="card-header bg-light">
                <h5 className="card-title mb-0">
                  <Package size={20} className="me-2" style={{ display: "inline" }} />
                  Tracking Timeline
                </h5>
              </div>
              <div className="card-body">
                {order.tracking && order.tracking.length > 0 ? (
                  <div className="timeline">
                    {order.tracking.map((event, index) => (
                      <div key={index} className="timeline-item mb-3">
                        <div className="d-flex">
                          <div className="timeline-marker me-3">
                            <div
                              className="rounded-circle bg-primary"
                              style={{
                                width: "12px",
                                height: "12px",
                                marginTop: "6px",
                              }}
                            ></div>
                          </div>
                          <div className="timeline-content flex-grow-1">
                            <h6 className="mb-1 fw-bold">{event.status}</h6>
                            <small className="text-muted d-block">
                              {event.date} at {event.time}
                            </small>
                            <small className="text-muted d-block">
                              <MapPin size={14} className="me-1" style={{ display: "inline" }} />
                              {event.location}
                            </small>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted">No tracking information available</p>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="col-lg-4">
            <div className="card shadow-sm sticky-top" style={{ top: "20px" }}>
              <div className="card-header bg-light">
                <h5 className="card-title mb-0">Order Summary</h5>
              </div>
              <div className="card-body">
                <div className="mb-3 pb-3 border-bottom">
                  <p className="text-muted mb-1">Order ID</p>
                  <p className="fw-bold">{order.id}</p>
                </div>
                <div className="mb-3 pb-3 border-bottom">
                  <p className="text-muted mb-1">Status</p>
                  <span
                    className="badge p-2"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {order.status}
                  </span>
                </div>
                <div className="mb-3 pb-3 border-bottom">
                  <p className="text-muted mb-1">Total Value</p>
                  <p className="fw-bold fs-5">${order.value.toLocaleString()}</p>
                </div>
                <div className="mb-3 pb-3 border-bottom">
                  <p className="text-muted mb-1">Weight</p>
                  <p className="fw-bold">{order.weight} kg</p>
                </div>
                <div className="mb-3">
                  <p className="text-muted mb-1">Priority Level</p>
                  <span className={`badge ${getPriorityBadge(order.priority)}`}>
                    {order.priority.charAt(0).toUpperCase() + order.priority.slice(1)}
                  </span>
                </div>
                <button
                  className="btn btn-primary w-100 mb-2"
                  onClick={() => {
                    toast.success("Order details copied to clipboard!");
                  }}
                >
                  Copy Details
                </button>
                {order.status !== "Delivered" && order.status !== "Cancelled" && (
                  <button
                    className="btn btn-outline-danger w-100"
                    disabled={canceling}
                    onClick={handleCancelOrder}
                  >
                    {canceling ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <X size={16} className="me-2" style={{ display: "inline" }} />
                        Cancel Order
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;
