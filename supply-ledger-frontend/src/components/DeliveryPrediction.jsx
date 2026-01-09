import { AlertTriangle, CheckCircle, Clock } from "lucide-react";

function DeliveryPrediction({ order }) {
  if (!order) return null;

  // 🔮 Mock ML logic (replace later with API)
  let delayRisk = "Low";
  let days = 3;

  if (order.priority === "critical") {
    days = 1;
    delayRisk = "Medium";
  }

  if (order.weight > 50) {
    days += 2;
    delayRisk = "High";
  }

  if (order.shipmentType === "international") {
    days += 4;
    delayRisk = "High";
  }

  const riskConfig = {
    Low: { color: "success", icon: CheckCircle },
    Medium: { color: "warning", icon: Clock },
    High: { color: "danger", icon: AlertTriangle },
  };

  const RiskIcon = riskConfig[delayRisk].icon;

  return (
    <div className="card border-0 shadow-sm mt-4">
      <div className="card-body">
        <h5 className="fw-bold mb-3">🔮 Delivery Prediction</h5>

        <div className="d-flex align-items-center gap-3 mb-3">
          <RiskIcon
            size={28}
            className={`text-${riskConfig[delayRisk].color}`}
          />
          <div>
            <div className="fw-semibold">
              Estimated Delivery: {days} days
            </div>
            <small className={`text-${riskConfig[delayRisk].color}`}>
              Delay Risk: {delayRisk}
            </small>
          </div>
        </div>

        <small className="text-muted">
          Prediction based on shipment attributes and historical patterns.
        </small>
      </div>
    </div>
  );
}

export default DeliveryPrediction;
