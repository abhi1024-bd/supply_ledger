import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import Navigation from "../components/Navigation";
import { Package, TrendingUp, CheckCircle, Clock, Plus } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { analytics, orders as ordersAPI } from "../services/api";
import toast from "react-hot-toast";

function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    if (authLoading || !user?.id) return;
    fetchDashboardData();
  }, [user?.id, authLoading]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const statsData = await analytics.getDashboard(user.id);

      setStats([
        { label: "Total Shipments", value: statsData.total_shipments, icon: Package, color: "primary" },
        { label: "In Transit", value: statsData.in_transit, icon: TrendingUp, color: "warning" },
        { label: "Delivered", value: statsData.delivered, icon: CheckCircle, color: "success" },
        { label: "Pending", value: statsData.pending, icon: Clock, color: "secondary" },
      ]);

      const ordersList = await ordersAPI.list(user.id);
      setRecentOrders(ordersList.slice(0, 5));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return <div className="min-vh-100 d-flex justify-content-center align-items-center">
      <div className="spinner-border" />
    </div>;
  }

  return (
    <div className="bg-light min-vh-100">
      <Navigation />

      <div className="container-fluid py-5">
        <div className="mx-auto" style={{ maxWidth: 1400 }}>
          <div className="d-flex justify-content-between align-items-center mb-5">
            <div>
              <h1 className="fw-bold">Shipment Dashboard</h1>
              <p className="text-muted">Real-time overview</p>
            </div>
            <button 
              className="btn btn-primary d-flex align-items-center gap-2" 
              style={{
                padding: "0.5rem 1.2rem",
                fontSize: "0.95rem",
                fontWeight: "500",
                borderRadius: "0.375rem",
                transition: "all 0.2s ease"
              }}
              onClick={() => navigate("/create-order")}
            >
              <Plus size={16} /> Create Order
            </button>
          </div>

          <div className="row g-4 mb-5">
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="col-md-6 col-lg-3">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body">
                      <Icon className={`text-${s.color}`} size={28} />
                      <h3 className="fw-bold mt-3">{s.value}</h3>
                      <div className="text-muted">{s.label}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-header fw-bold">Recent Orders</div>
            <table className="table table-hover mb-0">
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.order_id}>
                    <td>{order.order_id}</td>
                    <td>{order.destination}</td>
                    <td>{order.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;
