import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import { AuthContext } from "../context/AuthContext";
import { Plus, MapPin, Truck, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import DeliveryPrediction from "../components/DeliveryPrediction";
import { orders as ordersAPI, shipments as shipmentsAPI } from "../services/api";

function CreateOrder() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  if (authLoading) {
    return (
      <div className="bg-light min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  const [formData, setFormData] = useState({
    origin: "",
    destination: "",
    weight: "",
    dueDate: "",
    priority: "medium",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.origin || !formData.destination || !formData.weight || !formData.dueDate) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!user?.id) {
      toast.error("User not authenticated");
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        origin: formData.origin,
        destination: formData.destination,
        weight: parseFloat(formData.weight),
        priority: formData.priority,
        due_date: new Date(formData.dueDate).toISOString(),
      };

      const createdOrder = await ordersAPI.create(user.id, orderData);
      toast.success("Order created successfully");

      await shipmentsAPI.create({
        order_id: createdOrder.order_id,
        source: formData.origin,
        destination: formData.destination,
        distance_km: 5000,
      });

      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message || "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-light min-vh-100">
      <Navigation />

      <div className="container-fluid py-5">
        <div className="mx-auto" style={{ maxWidth: 900 }}>
          <h1 className="display-5 fw-bold mb-4">Create New Shipment</h1>

          <div className="card border-0 shadow-lg mb-4">
            <div className="card-body p-5">
              <div className="mb-4">
                <label className="form-label fw-semibold">
                  <MapPin size={16} className="me-2" /> Origin *
                </label>
                <input
                  name="origin"
                  value={formData.origin}
                  className="form-control form-control-lg"
                  onChange={handleChange}
                />
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">
                  <MapPin size={16} className="me-2" /> Destination *
                </label>
                <input
                  name="destination"
                  value={formData.destination}
                  className="form-control form-control-lg"
                  onChange={handleChange}
                />
              </div>

              <div className="row g-4 mb-4">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    <Truck size={16} className="me-2" /> Weight *
                  </label>
                  <input
                    name="weight"
                    type="number"
                    value={formData.weight}
                    className="form-control form-control-lg"
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    <Calendar size={16} className="me-2" /> Delivery Date *
                  </label>
                  <input
                    name="dueDate"
                    type="date"
                    value={formData.dueDate}
                    className="form-control form-control-lg"
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="form-select form-select-lg"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div className="d-flex gap-3 mt-4">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="btn btn-primary btn-lg flex-grow-1"
                >
                  {loading ? "Creating..." : <>
                    <Plus size={18} className="me-2" />
                    Create Shipment
                  </>}
                </button>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="btn btn-outline-secondary btn-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>

          <DeliveryPrediction
            order={{
              weight: Number(formData.weight) || 0,
              priority: formData.priority,
              shipmentType: "standard",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default CreateOrder;
