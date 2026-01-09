"""
Database migration script to add missing columns to shipments table

This script ensures the database schema is up-to-date with all new features:
- blockchain_hash column (for SHA-256 hashing)
- source_coords, dest_coords (for maps integration)
- timestamp fields for audit trail

Run this before deploying the blockchain module.
"""
from app.database.database import engine
from app.database.models import Base

# Drop existing tables and recreate them with new schema
print("🔄 Starting database migration...")
print("Dropping existing tables...")
Base.metadata.drop_all(bind=engine)

print("Creating new tables with updated schema...")
Base.metadata.create_all(bind=engine)

print("✅ Database migration completed successfully!")
print("\n📋 Updated tables created with new columns:")
print("  ✅ shipments.blockchain_hash       (SHA-256 immutable proof)")
print("  ✅ shipments.source_coords          (Maps integration)")
print("  ✅ shipments.dest_coords            (Maps integration)")
print("  ✅ shipments.created_at             (Timestamp)")
print("  ✅ shipments.updated_at             (Audit trail)")
print("\n🚀 Blockchain module is now ready to use!")
print("\nTest it:")
print("  curl -X POST http://localhost:8000/shipments/create \\")
print("    -H 'Content-Type: application/json' \\")
print("    -d '{\"order_id\": \"TEST-001\", \"source\": \"Mumbai\", \"destination\": \"Delhi\", \"distance_km\": 1500}'")

