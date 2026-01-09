from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.auth.auth_routes import router as auth_router
from app.shipments.shipment_routes import router as shipment_router
from app.users.user_routes import router as user_router
from app.orders.order_routes import router as order_router
from app.analytics.analytics_routes import router as analytics_router
from app.database.database import engine
from app.database import models

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SupplyLedger API",
    description="Blockchain and AI enabled Supply Chain System",
    version="1.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(user_router, prefix="/users", tags=["Users"])
app.include_router(order_router, prefix="/orders", tags=["Orders"])
app.include_router(shipment_router, prefix="/shipments", tags=["Shipments"])
app.include_router(analytics_router, prefix="/analytics", tags=["Analytics"])

@app.get("/")
def root():
    return {"message": "SupplyLedger Backend is running"}
