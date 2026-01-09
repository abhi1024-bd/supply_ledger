import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib

# synthetic dataset
data = {
    "distance": [50, 80, 120, 150, 180, 220, 300],
    "delayed": [0, 0, 0, 1, 1, 1, 1]
}

df = pd.DataFrame(data)

X = df[["distance"]]
y = df["delayed"]

model = RandomForestClassifier()
model.fit(X, y)

joblib.dump(model, "delay_model.pkl")
print("Model trained & saved")
