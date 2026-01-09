import { useContext, useEffect, useState } from "react";
import Navigation from "../components/Navigation";
import { AuthContext } from "../context/AuthContext";
import { User, Mail, Building2, Phone, MapPin } from "lucide-react";
import { analytics } from "../services/api";
import toast from "react-hot-toast";

function UserProfile() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (authLoading || !user?.id) return;
    analytics.getDashboard(user.id).then(setStats).catch(e => toast.error(e.message));
  }, [user?.id, authLoading]);

  if (authLoading) {
    return (
      <div className="bg-light min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100">
      <Navigation />

      <div className="container py-5">
        <div className="card border-0 shadow-lg mb-5">
          <div className="card-body p-5">
            <h2 className="fw-bold">{user?.name}</h2>
            <p className="text-muted">{user?.email}</p>
          </div>
        </div>

        <div className="row g-4">
          <ProfileCard icon={<User />} label="Company" value={user?.company_name} />
          <ProfileCard icon={<Phone />} label="Phone" value={user?.phone} />
          <ProfileCard icon={<MapPin />} label="Address" value={user?.address} />
          <ProfileCard icon={<Building2 />} label="Account Type" value={user?.account_type} />
        </div>

        {stats && (
          <div className="row g-4 mt-5">
            <StatCard label="Total Shipments" value={stats.total_shipments} />
            <StatCard label="Delivered" value={stats.delivered} />
            <StatCard label="In Transit" value={stats.in_transit} />
            <StatCard label="Pending" value={stats.pending} />
          </div>
        )}
      </div>
    </div>
  );
}

const ProfileCard = ({ icon, label, value }) => (
  <div className="col-md-6 col-lg-3">
    <div className="card border-0 shadow-sm">
      <div className="card-body">
        {icon}
        <div className="fw-bold mt-2">{label}</div>
        <div className="text-muted">{value || "N/A"}</div>
      </div>
    </div>
  </div>
);

const StatCard = ({ label, value }) => (
  <div className="col-md-6 col-lg-3">
    <div className="card border-0 shadow-sm">
      <div className="card-body">
        <h3 className="fw-bold">{value}</h3>
        <div className="text-muted">{label}</div>
      </div>
    </div>
  </div>
);

export default UserProfile;
