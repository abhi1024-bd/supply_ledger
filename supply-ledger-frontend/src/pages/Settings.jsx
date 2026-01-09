import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import { Bell, Lock, Eye, Mail, Smartphone } from "lucide-react";

function Settings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    twoFactorAuth: false,
    darkMode: false,
    orderUpdates: true,
    weeklyReports: true,
    promotions: false,
  });

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleToggle = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <>
      <Navigation />
      <div className="bg-light min-vh-100 py-5">
        <div className="container-fluid py-5">
            <div className="mx-auto" style={{ maxWidth: "1400px" }}>
          <div className="row">
            <div className="col-lg-8 offset-lg-2">
              <div className="mb-5">
                <h1 className="display-4 fw-bold mb-2">Settings</h1>
                <p className="lead text-muted">Manage your account preferences and notifications</p>
              </div>

              {/* Success Alert */}
              {saveSuccess && (
                <div className="alert alert-success alert-dismissible fade show mb-4" role="alert">
                  ✓ Settings saved successfully!
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setSaveSuccess(false)}
                  ></button>
                </div>
              )}

              {/* Notification Settings */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-light border-bottom">
                  <div className="d-flex align-items-center gap-3">
                    <Bell size={24} className="text-primary" />
                    <h5 className="card-title mb-0 fw-bold">Notifications</h5>
                  </div>
                </div>
                <div className="card-body p-4">
                  <div className="form-check form-switch mb-4">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="emailNotif"
                      checked={settings.emailNotifications}
                      onChange={() => handleToggle("emailNotifications")}
                    />
                    <label className="form-check-label" htmlFor="emailNotif">
                      <div className="fw-semibold">Email Notifications</div>
                      <small className="text-muted">Receive order updates via email</small>
                    </label>
                  </div>

                  <div className="form-check form-switch mb-4">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="smsNotif"
                      checked={settings.smsNotifications}
                      onChange={() => handleToggle("smsNotifications")}
                    />
                    <label className="form-check-label" htmlFor="smsNotif">
                      <div className="fw-semibold">SMS Notifications</div>
                      <small className="text-muted">Get alerts via text message</small>
                    </label>
                  </div>

                  <div className="form-check form-switch mb-4">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="orderUpdates"
                      checked={settings.orderUpdates}
                      onChange={() => handleToggle("orderUpdates")}
                    />
                    <label className="form-check-label" htmlFor="orderUpdates">
                      <div className="fw-semibold">Order Status Updates</div>
                      <small className="text-muted">Notify when orders change status</small>
                    </label>
                  </div>

                  <div className="form-check form-switch mb-4">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="weeklyReports"
                      checked={settings.weeklyReports}
                      onChange={() => handleToggle("weeklyReports")}
                    />
                    <label className="form-check-label" htmlFor="weeklyReports">
                      <div className="fw-semibold">Weekly Reports</div>
                      <small className="text-muted">Receive weekly summary reports</small>
                    </label>
                  </div>

                  <div className="form-check form-switch">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="promotions"
                      checked={settings.promotions}
                      onChange={() => handleToggle("promotions")}
                    />
                    <label className="form-check-label" htmlFor="promotions">
                      <div className="fw-semibold">Promotions & Offers</div>
                      <small className="text-muted">Get exclusive deals and promotions</small>
                    </label>
                  </div>
                </div>
              </div>

              {/* Privacy & Security */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-light border-bottom">
                  <div className="d-flex align-items-center gap-3">
                    <Lock size={24} className="text-danger" />
                    <h5 className="card-title mb-0 fw-bold">Privacy & Security</h5>
                  </div>
                </div>
                <div className="card-body p-4">
                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <div className="fw-semibold">Two-Factor Authentication</div>
                        <small className="text-muted">Add extra security to your account</small>
                      </div>
                      <div className="form-check form-switch m-0">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="twoFactor"
                          checked={settings.twoFactorAuth}
                          onChange={() => handleToggle("twoFactorAuth")}
                        />
                        <label className="form-check-label" htmlFor="twoFactor"></label>
                      </div>
                    </div>
                    <small className="text-muted d-block">
                      {settings.twoFactorAuth ? "Enabled - Your account is more secure" : "Disabled - Enhance your security"}
                    </small>
                  </div>

                  <hr />

                  <div className="mb-4">
                    <button className="btn btn-outline-primary btn-lg w-100 mb-2">
                      <Lock size={18} className="me-2" style={{ display: "inline" }} />
                      Change Password
                    </button>
                    <button className="btn btn-outline-primary btn-lg w-100">
                      <Eye size={18} className="me-2" style={{ display: "inline" }} />
                      Manage Active Sessions
                    </button>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-light border-bottom">
                  <div className="d-flex align-items-center gap-3">
                    <Mail size={24} className="text-info" />
                    <h5 className="card-title mb-0 fw-bold">Contact Information</h5>
                  </div>
                </div>
                <div className="card-body p-4">
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Email Address</label>
                    <input type="email" className="form-control form-control-lg" defaultValue="user@example.com" disabled />
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">Phone Number</label>
                    <input type="tel" className="form-control form-control-lg" placeholder="+1 (555) 123-4567" />
                  </div>

                  <div>
                    <label className="form-label fw-semibold">Backup Email</label>
                    <input type="email" className="form-control form-control-lg" placeholder="backup@example.com" />
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-light border-bottom">
                  <h5 className="card-title mb-0 fw-bold">Preferences</h5>
                </div>
                <div className="card-body p-4">
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Language</label>
                    <select className="form-select form-select-lg">
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">Timezone</label>
                    <select className="form-select form-select-lg">
                      <option>EST (Eastern Standard Time)</option>
                      <option>CST (Central Standard Time)</option>
                      <option>PST (Pacific Standard Time)</option>
                      <option>GMT (Greenwich Mean Time)</option>
                    </select>
                  </div>

                  <div className="form-check form-switch">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="darkMode"
                      checked={settings.darkMode}
                      onChange={() => handleToggle("darkMode")}
                    />
                    <label className="form-check-label" htmlFor="darkMode">
                      <div className="fw-semibold">Dark Mode</div>
                      <small className="text-muted">Use dark theme interface</small>
                    </label>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="d-flex gap-3">
                <button
                  onClick={handleSave}
                  className="btn btn-primary btn-lg flex-grow-1"
                >
                  Save Settings
                </button>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="btn btn-outline-secondary btn-lg"
                >
                  Cancel
                </button>
              </div>

              {/* Danger Zone */}
              <div className="card border-danger bg-light mt-5">
                <div className="card-body">
                  <h5 className="card-title text-danger fw-bold mb-3">Danger Zone</h5>
                  <p className="text-muted mb-3">Irreversible actions that cannot be undone</p>
                  <button className="btn btn-outline-danger btn-lg w-100">
                    Delete My Account
                  </button>
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

export default Settings;
