import cloudinary.uploader
import cloudinary.api
from cloudinary import config
import os

config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

def upload_image(file_bytes, filename=None):
    result = cloudinary.uploader.upload(
        file_bytes,
        public_id=filename or "product_images",
        folder="smartretail"
    )
    return result["secure_url"]