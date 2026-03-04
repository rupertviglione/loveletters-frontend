from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import stripe
from passlib.context import CryptContext
from jose import JWTError, jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# ===========================================
# CONFIGURATION - All from environment
# ===========================================

# MongoDB - Required
mongo_url = os.environ.get('MONGO_URL')
if not mongo_url:
    raise RuntimeError("MONGO_URL environment variable is required")

db_name = os.environ.get('DB_NAME')
if not db_name:
    raise RuntimeError("DB_NAME environment variable is required")

client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# Stripe - Required for payments
stripe.api_key = os.environ.get('STRIPE_API_KEY', '')
STRIPE_WEBHOOK_SECRET = os.environ.get('STRIPE_WEBHOOK_SECRET', '')

# JWT Security - Required, no defaults allowed
SECRET_KEY = os.environ.get('JWT_SECRET_KEY')
if not SECRET_KEY:
    raise RuntimeError("JWT_SECRET_KEY environment variable is required")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480  # 8 hours

# Admin credentials from environment
ADMIN_USERNAME = os.environ.get('ADMIN_USERNAME')
ADMIN_PASSWORD_HASH = os.environ.get('ADMIN_PASSWORD_HASH')

# CORS - Restrict to known origins
CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'https://weloveloveletters.netlify.app').split(',')

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

app = FastAPI(
    title="Love Letters API",
    description="E-commerce API for Love Letters store",
    version="1.0.0"
)
api_router = APIRouter(prefix="/api")

logger = logging.getLogger(__name__)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# ===========================================
# AUTH MODELS & FUNCTIONS
# ===========================================

class LoginRequest(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    
    user = await db.admins.find_one({"username": token_data.username}, {"_id": 0})
    if user is None:
        raise credentials_exception
    return user

# ===========================================
# DATA MODELS
# ===========================================

class ProductVariant(BaseModel):
    sizes: Optional[List[str]] = None
    colors: Optional[List[str]] = None

class BundleItem(BaseModel):
    product_id: str
    title_pt: str
    title_en: str

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title_pt: str
    title_en: str
    description_pt: str
    description_en: str
    category: str
    price: float
    original_price: Optional[float] = None
    variants: Optional[ProductVariant] = None
    images: List[str] = []
    is_bundle: bool = False
    bundle_items: Optional[List[BundleItem]] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    title_pt: str
    title_en: str
    description_pt: str
    description_en: str
    category: str
    price: float
    original_price: Optional[float] = None
    variants: Optional[ProductVariant] = None
    images: List[str] = []
    is_bundle: bool = False
    bundle_items: Optional[List[BundleItem]] = None

# Order item from client - only IDs and quantities, no prices!
class OrderItemInput(BaseModel):
    product_id: str
    quantity: int
    variant: Optional[Dict[str, str]] = None

# Full order item with price from database
class OrderItem(BaseModel):
    product_id: str
    title: str
    price: float
    quantity: int
    variant: Optional[Dict[str, str]] = None

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_number: str
    customer_email: EmailStr
    customer_name: str
    items: List[OrderItem]
    subtotal: float
    total: float
    status: str = "pending"
    payment_session_id: Optional[str] = None
    payment_status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Client only sends product IDs and quantities - prices come from DB
class OrderCreate(BaseModel):
    customer_email: EmailStr
    customer_name: str
    items: List[OrderItemInput]

class PaymentTransaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    amount: float
    currency: str
    metadata: Optional[Dict[str, Any]] = None
    payment_status: str = "pending"
    order_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CheckoutRequest(BaseModel):
    order_id: str
    origin_url: str

class ContactForm(BaseModel):
    name: str
    email: EmailStr
    message: str

# ===========================================
# PUBLIC ENDPOINTS
# ===========================================

@api_router.get("/")
async def root():
    return {"message": "We love Love Letters API"}

@api_router.get("/products", response_model=List[Product])
async def get_products(category: Optional[str] = None):
    query = {}
    if category and category != "all":
        query["category"] = category
    
    products = await db.products.find(query, {"_id": 0}).to_list(1000)
    
    for product in products:
        if isinstance(product.get('created_at'), str):
            product['created_at'] = datetime.fromisoformat(product['created_at'])
    
    return products

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if isinstance(product.get('created_at'), str):
        product['created_at'] = datetime.fromisoformat(product['created_at'])
    
    return product

@api_router.post("/products", response_model=Product)
async def create_product(product_input: ProductCreate):
    product_dict = product_input.model_dump()
    product_obj = Product(**product_dict)
    
    doc = product_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.products.insert_one(doc)
    logger.info(f"Product created: {product_obj.id}")
    return product_obj

# ===========================================
# ORDERS - Price calculated from DB, not client
# ===========================================

@api_router.post("/orders", response_model=Order)
async def create_order(order_input: OrderCreate, request: Request):
    try:
        order_items = []
        subtotal = 0.0
        
        # SECURITY: Get prices from database, not from client
        for item_input in order_input.items:
            product = await db.products.find_one({"id": item_input.product_id}, {"_id": 0})
            
            if not product:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Product not found: {item_input.product_id}"
                )
            
            # Use price from database
            price = product['price']
            item_total = price * item_input.quantity
            subtotal += item_total
            
            order_items.append(OrderItem(
                product_id=item_input.product_id,
                title=product['title_pt'],
                price=price,
                quantity=item_input.quantity,
                variant=item_input.variant
            ))
        
        total = subtotal
        order_number = f"LL-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
        
        order_obj = Order(
            order_number=order_number,
            customer_email=order_input.customer_email,
            customer_name=order_input.customer_name,
            items=order_items,
            subtotal=subtotal,
            total=total
        )
        
        doc = order_obj.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        
        await db.orders.insert_one(doc)
        
        logger.info(f"Order created: {order_obj.id}, total: €{total:.2f}, customer: {order_input.customer_email}")
        
        return order_obj
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating order: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str):
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if isinstance(order.get('created_at'), str):
        order['created_at'] = datetime.fromisoformat(order['created_at'])
    
    return order

# ===========================================
# STRIPE CHECKOUT
# ===========================================

@api_router.post("/checkout/session")
async def create_checkout_session(checkout_req: CheckoutRequest, request: Request):
    try:
        order = await db.orders.find_one({"id": checkout_req.order_id}, {"_id": 0})
        
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        if not stripe.api_key:
            raise HTTPException(status_code=500, detail="Stripe API key not configured")
        
        # Create Stripe checkout session
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'eur',
                    'product_data': {
                        'name': 'Love Letters Order',
                        'description': f"Order #{order['order_number']}"
                    },
                    'unit_amount': int(order['total'] * 100),
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=f"{checkout_req.origin_url}/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{checkout_req.origin_url}/cart",
            metadata={
                'order_id': checkout_req.order_id,
                'customer_email': order['customer_email'],
                'customer_name': order['customer_name']
            }
        )
        
        await db.orders.update_one(
            {"id": checkout_req.order_id},
            {"$set": {"payment_session_id": session.id}}
        )
        
        payment_transaction = PaymentTransaction(
            session_id=session.id,
            amount=float(order['total']),
            currency="eur",
            metadata={
                "order_id": checkout_req.order_id,
                "customer_email": order['customer_email'],
                "customer_name": order['customer_name']
            },
            payment_status="pending",
            order_id=checkout_req.order_id
        )
        
        transaction_doc = payment_transaction.model_dump()
        transaction_doc['created_at'] = transaction_doc['created_at'].isoformat()
        transaction_doc['updated_at'] = transaction_doc['updated_at'].isoformat()
        
        await db.payment_transactions.insert_one(transaction_doc)
        
        logger.info(f"Checkout session created: {session.id} for order: {checkout_req.order_id}")
        
        return {
            "session_id": session.id,
            "url": session.url,
            "status": "created"
        }
        
    except Exception as e:
        logger.error(f"Error creating checkout session: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/checkout/status/{session_id}")
async def get_checkout_status(session_id: str):
    try:
        if not stripe.api_key:
            raise HTTPException(status_code=500, detail="Stripe API key not configured")
        
        session = stripe.checkout.Session.retrieve(session_id)
        
        transaction = await db.payment_transactions.find_one(
            {"session_id": session_id},
            {"_id": 0}
        )
        
        if not transaction:
            raise HTTPException(status_code=404, detail="Transaction not found")
        
        payment_status = "paid" if session.payment_status == "paid" else "pending"
        
        if payment_status == "paid" and transaction['payment_status'] != "paid":
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {
                    "$set": {
                        "payment_status": "paid",
                        "updated_at": datetime.now(timezone.utc).isoformat()
                    }
                }
            )
            
            if transaction.get('order_id'):
                await db.orders.update_one(
                    {"id": transaction['order_id']},
                    {
                        "$set": {
                            "payment_status": "paid",
                            "status": "confirmed"
                        }
                    }
                )
                logger.info(f"Payment confirmed for order: {transaction['order_id']}")
        
        return {
            "status": session.status,
            "payment_status": payment_status,
            "amount_total": session.amount_total,
            "currency": session.currency,
            "metadata": session.metadata
        }
        
    except Exception as e:
        logger.error(f"Error getting checkout status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ===========================================
# STRIPE WEBHOOK - With signature verification
# ===========================================

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    try:
        payload = await request.body()
        sig_header = request.headers.get("Stripe-Signature")
        
        if not sig_header:
            logger.warning("Webhook received without Stripe signature")
            raise HTTPException(status_code=400, detail="Missing stripe signature")
        
        # SECURITY: Verify webhook signature
        if STRIPE_WEBHOOK_SECRET:
            try:
                event = stripe.Webhook.construct_event(
                    payload, sig_header, STRIPE_WEBHOOK_SECRET
                )
            except stripe.error.SignatureVerificationError as e:
                logger.warning(f"Webhook signature verification failed: {str(e)}")
                raise HTTPException(status_code=400, detail="Invalid signature")
        else:
            # Fallback for development (log warning)
            logger.warning("STRIPE_WEBHOOK_SECRET not set - skipping signature verification")
            event = stripe.Event.construct_from(
                stripe.util.json.loads(payload), stripe.api_key
            )
        
        if event.type == 'checkout.session.completed':
            session = event.data.object
            
            transaction = await db.payment_transactions.find_one(
                {"session_id": session.id},
                {"_id": 0}
            )
            
            if transaction and transaction['payment_status'] != "paid":
                await db.payment_transactions.update_one(
                    {"session_id": session.id},
                    {
                        "$set": {
                            "payment_status": "paid",
                            "updated_at": datetime.now(timezone.utc).isoformat()
                        }
                    }
                )
                
                if transaction.get('order_id'):
                    await db.orders.update_one(
                        {"id": transaction['order_id']},
                        {
                            "$set": {
                                "payment_status": "paid",
                                "status": "confirmed"
                            }
                        }
                    )
                    logger.info(f"Webhook: Payment confirmed for order: {transaction['order_id']}")
        
        return {"status": "success"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Webhook error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

# ===========================================
# CONTACT FORM
# ===========================================

@api_router.post("/contact")
async def submit_contact(form: ContactForm):
    try:
        contact_doc = {
            "id": str(uuid.uuid4()),
            "name": form.name,
            "email": form.email,
            "message": form.message,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.contacts.insert_one(contact_doc)
        
        logger.info(f"Contact form submitted: {form.email}")
        
        return {"message": "Message sent successfully", "success": True}
        
    except Exception as e:
        logger.error(f"Error submitting contact form: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ===========================================
# ADMIN ENDPOINTS
# ===========================================

@api_router.post("/admin/login", response_model=Token)
async def admin_login(login_req: LoginRequest, request: Request):
    # Check if admin credentials are configured
    if not ADMIN_USERNAME or not ADMIN_PASSWORD_HASH:
        logger.error("Admin credentials not configured in environment")
        raise HTTPException(status_code=500, detail="Admin not configured")
    
    # Check if admin user exists in DB
    admin = await db.admins.find_one({"username": login_req.username}, {"_id": 0})
    
    if not admin:
        # Create admin user if credentials match env vars
        if login_req.username == ADMIN_USERNAME and pwd_context.verify(login_req.password, ADMIN_PASSWORD_HASH):
            admin_doc = {
                "username": ADMIN_USERNAME,
                "hashed_password": ADMIN_PASSWORD_HASH,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.admins.insert_one(admin_doc)
            admin = admin_doc
            logger.info(f"Admin user created: {ADMIN_USERNAME}")
        else:
            logger.warning(f"Failed login attempt for: {login_req.username}")
            raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify password
    if not verify_password(login_req.password, admin['hashed_password']):
        logger.warning(f"Failed login attempt for: {login_req.username}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": admin['username']}, expires_delta=access_token_expires
    )
    
    logger.info(f"Admin login successful: {admin['username']}")
    
    return {"access_token": access_token, "token_type": "bearer"}

@api_router.get("/admin/verify")
async def verify_admin(current_user: dict = Depends(get_current_user)):
    return {"username": current_user['username'], "authenticated": True}

# Admin - Products Management
@api_router.put("/admin/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product_input: ProductCreate, current_user: dict = Depends(get_current_user)):
    existing_product = await db.products.find_one({"id": product_id}, {"_id": 0})
    
    if not existing_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product_dict = product_input.model_dump()
    product_dict['id'] = product_id
    product_dict['created_at'] = existing_product.get('created_at', datetime.now(timezone.utc).isoformat())
    
    await db.products.replace_one({"id": product_id}, product_dict)
    
    logger.info(f"Product updated: {product_id} by {current_user['username']}")
    
    product_obj = Product(**product_dict)
    if isinstance(product_obj.created_at, str):
        product_obj.created_at = datetime.fromisoformat(product_obj.created_at)
    
    return product_obj

@api_router.delete("/admin/products/{product_id}")
async def delete_product(product_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.products.delete_one({"id": product_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    logger.info(f"Product deleted: {product_id} by {current_user['username']}")
    
    return {"message": "Product deleted successfully"}

# Admin - Orders Management
@api_router.get("/admin/orders")
async def get_all_orders(current_user: dict = Depends(get_current_user)):
    orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    for order in orders:
        if isinstance(order.get('created_at'), str):
            order['created_at'] = datetime.fromisoformat(order['created_at'])
    
    return orders

# Admin - Contacts Management
@api_router.get("/admin/contacts")
async def get_all_contacts(current_user: dict = Depends(get_current_user)):
    contacts = await db.contacts.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    for contact in contacts:
        if isinstance(contact.get('created_at'), str):
            contact['created_at'] = datetime.fromisoformat(contact['created_at'])
    
    return contacts

@api_router.delete("/admin/contacts/{contact_id}")
async def delete_contact(contact_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.contacts.delete_one({"id": contact_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    logger.info(f"Contact deleted: {contact_id} by {current_user['username']}")
    
    return {"message": "Contact deleted successfully"}

# ===========================================
# APP SETUP
# ===========================================

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
