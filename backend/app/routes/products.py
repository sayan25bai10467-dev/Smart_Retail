from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from typing import Optional, List
from bson import ObjectId
from datetime import datetime

from app.database import db
from app.auth import verify_jwt
from app.utils.cloudinary import upload_image

router = APIRouter(prefix="/products", tags=["products"])


def get_current_user_id(token: str = Depends(verify_jwt)):
    if not token:
        raise HTTPException(status_code=401, detail="Invalid or missing token")
    return token


@router.get("/")
async def list_products(
    category: Optional[str] = None,
    condition: Optional[str] = None,
    hostel: Optional[str] = None,
    dept: Optional[str] = None,
    semester: Optional[str] = None,
    search: Optional[str] = None,
    sort: Optional[str] = "popular",
    limit: int = 20,
    skip: int = 0
):
    filter = {}
    if category:
        filter["category"] = category
    if condition:
        filter["condition"] = condition
    if hostel:
        filter["hostel"] = hostel
    if dept:
        filter["dept"] = dept
    if semester:
        filter["semester"] = semester
    if search:
        filter["$text"] = {"$search": search}

    sort_options = {
        "popular": [("created_at", -1)],
        "recent": [("created_at", -1)],
        "price-low": [("price", 1)],
        "price-high": [("price", -1)]
    }
    sort_criteria = sort_options.get(sort, [("created_at", -1)])

    cursor = db.products.find(filter).sort(sort_criteria).skip(skip).limit(limit)
    products = await cursor.to_list(length=limit)
    for p in products:
        p["id"] = str(p["_id"])
        p["seller_id"] = str(p["seller_id"])
        del p["_id"]
    return products


@router.get("/{product_id}")
async def get_product(product_id: str):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid product ID")
    product = await db.products.find_one({"_id": ObjectId(product_id)})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product["id"] = str(product["_id"])
    product["seller_id"] = str(product["seller_id"])
    del product["_id"]
    return product


@router.post("/")
async def create_product(
    title: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    mrp: Optional[float] = Form(None),
    category: str = Form(...),
    condition: str = Form(...),
    negotiable: bool = Form(True),
    dept: str = Form(...),
    semester: str = Form(...),
    hostel: str = Form(...),
    pickup_location: str = Form(...),
    images: List[UploadFile] = File([]),
    user_id: str = Depends(get_current_user_id)
):
    try:
        # Upload images to Cloudinary
        image_urls = []
        for img in images:
            if img.size > 0:
                content = await img.read()
                url = upload_image(content)
                image_urls.append(url)

        product_data = {
            "title": title,
            "description": description,
            "price": price,
            "mrp": mrp,
            "category": category,
            "condition": condition,
            "negotiable": negotiable,
            "dept": dept,
            "semester": semester,
            "hostel": hostel,
            "pickup_location": pickup_location,
            "images": image_urls,
            "seller_id": ObjectId(user_id),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        result = await db.products.insert_one(product_data)
        created_product = await db.products.find_one({"_id": result.inserted_id})
        created_product["id"] = str(created_product["_id"])
        created_product["seller_id"] = str(created_product["seller_id"])
        del created_product["_id"]
        return created_product

    except Exception as e:
        print(f"Error creating product: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.put("/{product_id}")
async def update_product(
    product_id: str,
    product_update: dict,
    user_id: str = Depends(get_current_user_id)
):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid product ID")
    product = await db.products.find_one({"_id": ObjectId(product_id)})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if str(product["seller_id"]) != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this product")

    product_update["updated_at"] = datetime.utcnow()
    await db.products.update_one(
        {"_id": ObjectId(product_id)},
        {"$set": product_update}
    )
    return {"message": "Product updated"}


@router.delete("/{product_id}")
async def delete_product(
    product_id: str,
    user_id: str = Depends(get_current_user_id)
):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid product ID")
    product = await db.products.find_one({"_id": ObjectId(product_id)})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if str(product["seller_id"]) != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this product")
    await db.products.delete_one({"_id": ObjectId(product_id)})
    return {"message": "Product deleted"}