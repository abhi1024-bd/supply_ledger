import { useContext, useEffect, useState } from "react";
import Navigation from "../components/Navigation";
import { AuthContext } from "../context/AuthContext";
import { TrendingUp, BarChart3, PieChart, Clock, AlertTriangle } from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import toast from "react-hot-toast";
import { analytics } from "../services/api";

function Analytics() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [statusData, setStatusData] = useState([]);
  const [priorityData, setPriorityData] = useState([]);
  const [destinationData, setDestinationData] = useState([]);
  const [valueMetrics, setValueMetrics] = useState(null);

  useEffect(() => {
    if (authLoading || !user?.id) return;
    fetchAnalyticsData();
  }, [user?.id, authLoading]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      // Fetch all analytics data in parallel
      const [dashboard, statusBreakdown, priorityBreakdown, destinationBreakdown, metrics] = 
        await Promise.all([
          analytics.getDashboard(user.id),
          analytics.getStatusBreakdown(user.id),
          analytics.getPriorityBreakdown(user.id),
          analytics.getDestinationBreakdown(user.id),
          analytics.getValueMetrics(user.id),
        ]);

      // Format stats
      setStats({
        totalOrders: dashboard.total_shipments,
        inTransit: dashboard.in_transit,
        delivered: dashboard.delivered,
        pending: dashboard.pending,
      });

      // Format status data for pie chart
      setStatusData([
        { name: "Delivered", value: statusBreakdown.delivered, color: "#28a745" },
        { name: "In Transit", value: statusBreakdown.in_transit, color: "#ffc107" },
        { name: "Pending", value: statusBreakdown.pending, color: "#6c757d" },
      ]);

      // Format priority data for bar chart
      setPriorityData([
        { name: "CRITICAL", count: priorityBreakdown.critical },
        { name: "HIGH", count: priorityBreakdown.high },
        { name: "MEDIUM", count: priorityBreakdown.medium },
        { name: "LOW", count: priorityBreakdown.low },
      ]);

      // Format destination data
      setDestinationData(destinationBreakdown.destinations || []);

      // Set value metrics
      setValueMetrics(metrics);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
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
    <div className="min-vh-100 bg-light">
      <Navigation />

      <div className="container-fluid py-5">
        <div className="mx-auto" style={{ maxWidth: 1400 }}>
          <h2 className="mb-4">Analytics Dashboard</h2>

          <div className="row g-3 mb-4">
            <KpiCard title="Total Orders" value={stats?.totalOrders || 0} icon={<TrendingUp />} />
            <KpiCard title="In Transit" value={stats?.inTransit || 0} icon={<Clock />} />
            <KpiCard title="Total Value" value={`$${(valueMetrics?.total_value / 1000).toFixed(1)}K`} icon={<BarChart3 />} />
            <KpiCard title="Avg Order" value={`$${(valueMetrics?.average_value / 1000).toFixed(1)}K`} icon={<PieChart />} />
            <KpiCard 
              title="High Risk Shipments" 
              value={priorityData.find(p => p.name === "CRITICAL")?.count || 0} 
              icon={<AlertTriangle />} 
              color="danger" 
            />
          </div>

          <div className="row g-4">
            <ChartCard title="Order Status">
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPie>
                    <Pie data={statusData} dataKey="value" label>
                      {statusData.map((s, i) => (
                        <Cell key={i} fill={s.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPie>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-muted py-5">No data available</div>
              )}
            </ChartCard>

            <ChartCard title="Priority Breakdown">
              {priorityData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={priorityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0d6efd" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-muted py-5">No data available</div>
              )}
            </ChartCard>
          </div>

          {destinationData.length > 0 && (
            <div className="row g-4 mt-4">
              <ChartCard title="Top Destinations">
                <div className="list-group">
                  {destinationData.map((dest, idx) => (
                    <div key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                      <span>{dest.name}</span>
                      <span className="badge bg-primary rounded-pill">{dest.orders}</span>
                    </div>
                  ))}
                </div>
              </ChartCard>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const KpiCard = ({ title, value, icon, color = "primary" }) => (
  <div className="col-md-6 col-lg-3">
    <div className="card border-0 shadow-sm">
      <div className="card-body d-flex align-items-center">
        <div className={`me-3 text-${color}`}>{icon}</div>
        <div>
          <small className="text-muted">{title}</small>
          <h4 className="mb-0">{value}</h4>
        </div>
      </div>
    </div>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div className="col-lg-6">
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-light fw-semibold">{title}</div>
      <div className="card-body">{children}</div>
    </div>
  </div>
);

export default Analytics;
