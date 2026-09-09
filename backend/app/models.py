from typing import Optional, List, Annotated, Any
from datetime import datetime
from bson import ObjectId
from pydantic import BaseModel, EmailStr, Field, GetJsonSchemaHandler
from pydantic.json_schema import JsonSchemaValue
from pydantic_core import core_schema


# ---------- Custom ObjectId type ----------
class PyObjectId:
    @classmethod
    def __get_pydantic_core_schema__(cls, _source_type: Any, _handler: Any) -> core_schema.CoreSchema:
        def validate_from_str(value: str) -> ObjectId:
            if ObjectId.is_valid(value):
                return ObjectId(value)
            raise ValueError("Invalid ObjectId format")
        return core_schema.union_schema([
            core_schema.is_instance_schema(ObjectId),
            core_schema.no_info_plain_validator_function(validate_from_str),
        ],
        serialization=core_schema.to_string_ser_schema(),
        )

    @classmethod
    def __get_pydantic_json_schema__(cls, _core_schema: core_schema.CoreSchema, handler: GetJsonSchemaHandler) -> JsonSchemaValue:
        json_schema = handler(core_schema.str_schema())
        json_schema.update({
            "type": "string",
            "format": "objectid",
            "example": "5eb7cf5a86d9755df3a6c593"
        })
        return json_schema


PydanticObjectId = Annotated[ObjectId, PyObjectId]


# ---------- User Models ----------
class UserBase(BaseModel):
    email: EmailStr
    name: str


class UserCreate(UserBase):
    password: str


class UserInDB(UserBase):
    id: PydanticObjectId = Field(default_factory=ObjectId, alias="_id")
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }


class UserLogin(BaseModel):
    email: EmailStr
    password: str


# ---------- Product Models ----------
class ProductBase(BaseModel):
    title: str
    description: str
    price: float
    mrp: Optional[float] = None
    category: str
    condition: str
    negotiable: bool = True
    dept: str
    semester: str
    hostel: str
    pickup_location: str
    images: List[str] = []


class ProductCreate(ProductBase):
    pass


class Product(ProductBase):
    id: PydanticObjectId = Field(default_factory=ObjectId, alias="_id")
    seller_id: PydanticObjectId
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }


# ---------- Wishlist Model ----------
class WishlistItem(BaseModel):
    user_id: PydanticObjectId
    product_id: PydanticObjectId
    added_at: datetime = Field(default_factory=datetime.utcnow)


# ---------- Order Model ----------
class OrderBase(BaseModel):
    product_id: PydanticObjectId
    buyer_id: PydanticObjectId
    seller_id: PydanticObjectId


class Order(OrderBase):
    id: PydanticObjectId = Field(default_factory=ObjectId, alias="_id")
    status: str = "pending"
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }