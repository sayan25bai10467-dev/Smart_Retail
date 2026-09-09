from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, products, users, wishlist, orders
from app.database import db

app = FastAPI(title="SmartReatile API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5500", "http://127.0.0.1:5500", "http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(products.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(wishlist.router, prefix="/api")
app.include_router(orders.router, prefix="/api")


@app.on_event("startup")
async def create_indexes():
    await db.products.create_index([("title", "text"), ("description", "text")])


@app.get("/")
async def root():
    return {"message": "SmartReatile API is running"}
    from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# Enable CORS so your Live Server (port 5500) can talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Use ["*"] for development to allow any origin
    allow_credentials=True,
    allow_methods=["*"], # Allow all standard HTTP methods
    allow_headers=["*"], # Allow all headers
)

# Define the data structure we expect from the frontend
class ChatRequest(BaseModel):
    message: str

# Create the Chatbot API Route
@app.post("/api/chat")
async def chat_with_bot(request: ChatRequest):
    user_text = request.message.lower()
    
    # ---------------------------------------------------------
    # 1. NEW FEATURES: Greetings, Small Talk & Help Menu
    # ---------------------------------------------------------
    if any(word in user_text for word in ["hi", "hello", "hey", "namaste"]):
        reply = "Hello there! I'm your SmartReatile Campus Assistant. How can I help you today?"
        
    elif "how are you" in user_text:
        reply = "I'm doing great, thanks for asking! Ready to help you find the best campus deals."
        
    elif any(word in user_text for word in ["who are you", "your name", "what are you"]):
        reply = "I am the SmartReatile AI assistant, built specifically for our campus! I can help you search for items, explain platform rules, or guide you on how to trade."
        
    elif any(word in user_text for word in ["help", "what can you do", "features", "menu"]):
        reply = "Here is what I can do: 1. Teach you how to buy/sell. 2. Find items like cycles, laptops, or textbooks. 3. Answer questions about campus deliveries and UPI payments. Try asking: 'How do I sell my cycle?'"

    # ---------------------------------------------------------
    # 2. PREVIOUS FEATURES: Campus, Buying, Selling & Products
    # ---------------------------------------------------------
    
    # Campus Clubs & Events
    elif any(word in user_text for word in ["event", "club", "fest", "management"]):
        reply = "Organizing a club event? SmartReatile is a great place to rent PA systems, buy bulk decorations, or find event management supplies directly from other students!"

    # Buying & Selling Instructions
    elif any(word in user_text for word in ["how to buy", "buy", "purchase"]):
        reply = "To buy: Browse the homepage, click on an item you like, and use the 'Contact' button to message the seller and arrange a meetup near the academic blocks."
    
    elif any(word in user_text for word in ["how to sell", "sell", "post", "upload"]):
        reply = "To sell: Click 'Sell Item' in the menu, upload a clear picture, set a fair price, and write a quick description. It will go live instantly!"
        
    # Website FAQs & Policies
    elif any(word in user_text for word in ["delivery", "shipping", "courier", "where"]):
        reply = "We don't use external couriers! SmartReatile is exclusively for our campus. You simply meet the seller in person, check the item, and take it."
        
    elif any(word in user_text for word in ["payment", "pay", "upi", "cash"]):
        reply = "Payments are completely peer-to-peer. We don't take a cut. You just pay the seller directly via UPI or cash when you meet them."
        
    # Product Categories (Tech, Books, Cycles)
    elif any(word in user_text for word in ["cycle", "bicycle"]):
        reply = "Cycles sell fast! We usually have a few listed by seniors. Check the search bar to see what's available near your hostel today."
        
    elif any(word in user_text for word in ["book", "textbook", "notes", "cse", "b.tech", "engineering"]):
        reply = "We have plenty of engineering textbooks, lab manuals, and even handwritten notes. Try searching for your specific semester or subject!"

    elif any(word in user_text for word in ["laptop", "pc", "keyboard", "mouse", "gaming"]):
        reply = "Looking for tech gear? You can find used laptops, gaming keyboards, and mice in the Electronics section."
    
    # ---------------------------------------------------------
    # 3. FALLBACK RESPONSE
    # ---------------------------------------------------------
    else:
        reply = "I'm still learning, but I'm here to help you navigate SmartReatile! Try asking me about 'how to buy', 'cycles', or just say 'help'."
        
    return {"response": reply}
import joblib
from pydantic import BaseModel

# Load the trained model when the server starts
price_model = joblib.load('price_estimator.pkl')

class PriceRequest(BaseModel):
    original_price: float
    age_months: int
    condition: int # 1 to 5 scale

@app.post("/api/predict-price")
async def predict_price(request: PriceRequest):
    # Prepare the data exactly as the model was trained
    features = [[request.original_price, request.age_months, request.condition]]
    
    # Predict the price
    predicted_price = price_model.predict(features)[0]
    
    # Return a slightly rounded range (e.g., ₹3000 -> ₹2800 to ₹3200)
    lower_bound = round(predicted_price * 0.9)
    upper_bound = round(predicted_price * 1.1)
    
    return {
        "suggested_price": round(predicted_price),
        "range": f"₹{lower_bound} - ₹{upper_bound}"
    }