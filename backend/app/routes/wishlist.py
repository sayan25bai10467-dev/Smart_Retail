from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from app.database import db
from app.auth import verify_jwt

router = APIRouter(prefix="/wishlist", tags=["wishlist"])

def get_current_user_id(token: str = Depends(verify_jwt)):
    if not token:
        raise HTTPException(status_code=401, detail="Invalid token")
    return token

@router.get("/")
async def get_wishlist(user_id: str = Depends(get_current_user_id)):
    cursor = db.wishlists.find({"user_id": ObjectId(user_id)})
    wishlist_items = await cursor.to_list(length=None)
    product_ids = [item["product_id"] for item in wishlist_items]
    products = []
    for pid in product_ids:
        product = await db.products.find_one({"_id": pid})
        if product:
            product["id"] = str(product["_id"])
            product["seller_id"] = str(product["seller_id"])
            del product["_id"]
            products.append(product)
    return products

@router.post("/{product_id}")
async def add_to_wishlist(product_id: str, user_id: str = Depends(get_current_user_id)):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid product ID")
    # Check if product exists
    product = await db.products.find_one({"_id": ObjectId(product_id)})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    # Check if already in wishlist
    existing = await db.wishlists.find_one({
        "user_id": ObjectId(user_id),
        "product_id": ObjectId(product_id)
    })
    if existing:
        return {"message": "Already in wishlist"}
    await db.wishlists.insert_one({
        "user_id": ObjectId(user_id),
        "product_id": ObjectId(product_id)
    })
    return {"message": "Added to wishlist"}

@router.delete("/{product_id}")
async def remove_from_wishlist(product_id: str, user_id: str = Depends(get_current_user_id)):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid product ID")
    result = await db.wishlists.delete_one({
        "user_id": ObjectId(user_id),
        "product_id": ObjectId(product_id)
    })
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Wishlist item not found")
    return {"message": "Removed from wishlist"}