from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from datetime import datetime
from app.database import db
from app.auth import verify_jwt
from app.models import Order

router = APIRouter(prefix="/orders", tags=["orders"])

def get_current_user_id(token: str = Depends(verify_jwt)):
    if not token:
        raise HTTPException(status_code=401, detail="Invalid token")
    return token

@router.post("/")
async def create_order(product_id: str, user_id: str = Depends(get_current_user_id)):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid product ID")
    product = await db.products.find_one({"_id": ObjectId(product_id)})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    seller_id = product["seller_id"]
    if str(seller_id) == user_id:
        raise HTTPException(status_code=400, detail="Cannot buy your own product")

    # Check if already ordered (optional)
    existing = await db.orders.find_one({
        "product_id": ObjectId(product_id),
        "buyer_id": ObjectId(user_id),
        "status": {"$ne": "cancelled"}
    })
    if existing:
        raise HTTPException(status_code=400, detail="You already have an active order for this product")

    order = {
        "product_id": ObjectId(product_id),
        "buyer_id": ObjectId(user_id),
        "seller_id": seller_id,
        "status": "pending",
        "created_at": datetime.utcnow()
    }
    result = await db.orders.insert_one(order)
    inserted = await db.orders.find_one({"_id": result.inserted_id})
    inserted["id"] = str(inserted["_id"])
    inserted["product_id"] = str(inserted["product_id"])
    inserted["buyer_id"] = str(inserted["buyer_id"])
    inserted["seller_id"] = str(inserted["seller_id"])
    del inserted["_id"]
    return inserted

@router.get("/")
async def get_orders(user_id: str = Depends(get_current_user_id)):
    cursor = db.orders.find({"buyer_id": ObjectId(user_id)})
    orders = await cursor.to_list(length=None)
    for o in orders:
        o["id"] = str(o["_id"])
        o["product_id"] = str(o["product_id"])
        o["buyer_id"] = str(o["buyer_id"])
        o["seller_id"] = str(o["seller_id"])
        del o["_id"]
    return orders