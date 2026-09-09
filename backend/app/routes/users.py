from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from app.database import db
from app.auth import verify_jwt

router = APIRouter(prefix="/users", tags=["users"])

def get_current_user_id(token: str = Depends(verify_jwt)):
    if not token:
        raise HTTPException(status_code=401, detail="Invalid token")
    return token

@router.get("/me")
async def get_current_user(user_id: str = Depends(get_current_user_id)):
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user["id"] = str(user["_id"])
    del user["_id"]
    del user["hashed_password"]   # Don't expose password hash
    return user