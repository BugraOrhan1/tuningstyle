from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form, Header, status
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import jwt
import bcrypt
import shutil
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

UPLOAD_DIR = ROOT_DIR / 'uploads'
UPLOAD_DIR.mkdir(exist_ok=True)

JWT_SECRET = os.environ.get('JWT_SECRET', 'fct-super-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRE_HOURS = 24 * 7
ADMIN_EMAIL = 'admin@fast-chiptuningfiles.com'

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")


# ---------- Models ----------
class UserPublic(BaseModel):
    id: str
    email: str
    firstName: str
    lastName: str
    company: str = ''
    phone: str = ''
    country: str = ''
    vatNumber: str = ''
    credits: int = 0
    is_admin: bool = False
    language: str = 'en'
    createdAt: str


class RegisterIn(BaseModel):
    email: EmailStr
    password: str
    firstName: str
    lastName: str
    company: Optional[str] = ''
    phone: Optional[str] = ''
    country: Optional[str] = ''
    vatNumber: Optional[str] = ''


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class UpdateProfileIn(BaseModel):
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    company: Optional[str] = None
    phone: Optional[str] = None
    country: Optional[str] = None
    vatNumber: Optional[str] = None
    language: Optional[str] = None


class ChangePasswordIn(BaseModel):
    currentPassword: str
    newPassword: str


class MessageIn(BaseModel):
    content: str


class StatusUpdateIn(BaseModel):
    status: str  # pending | in_progress | completed | rejected


class CreditsAdjustIn(BaseModel):
    amount: int  # can be negative
    reason: Optional[str] = ''


class PurchaseIn(BaseModel):
    packageId: str


CREDIT_PACKAGES = {
    'pkg_5': {'credits': 5, 'price': 50},
    'pkg_10': {'credits': 10, 'price': 95},
    'pkg_25': {'credits': 25, 'price': 225},
    'pkg_50': {'credits': 50, 'price': 425},
    'pkg_100': {'credits': 100, 'price': 800},
}


# ---------- Helpers ----------
def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()


def verify_password(pw: str, h: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), h.encode())
    except Exception:
        return False


def create_token(user_id: str) -> str:
    payload = {
        'sub': user_id,
        'exp': datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRE_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def public_user(u: dict) -> dict:
    if not u:
        return None
    return {
        'id': u['_id'],
        'email': u['email'],
        'firstName': u.get('firstName', ''),
        'lastName': u.get('lastName', ''),
        'company': u.get('company', ''),
        'phone': u.get('phone', ''),
        'country': u.get('country', ''),
        'vatNumber': u.get('vatNumber', ''),
        'credits': u.get('credits', 0),
        'is_admin': u.get('is_admin', False),
        'language': u.get('language', 'en'),
        'createdAt': u.get('createdAt', ''),
    }


def public_file(f: dict) -> dict:
    return {
        'id': f['_id'],
        'userId': f.get('userId'),
        'userEmail': f.get('userEmail'),
        'userName': f.get('userName'),
        'fileName': f.get('fileName'),
        'vehicle': f.get('vehicle'),
        'ecu': f.get('ecu'),
        'tuningOptions': f.get('tuningOptions', []),
        'status': f.get('status', 'pending'),
        'credits': f.get('credits', 0),
        'note': f.get('note', ''),
        'uploadedAt': f.get('uploadedAt'),
        'completedAt': f.get('completedAt'),
        'tunedFileName': f.get('tunedFileName'),
        'hasOriginal': bool(f.get('originalPath')),
        'hasTuned': bool(f.get('tunedPath')),
    }


async def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(status_code=401, detail='Missing token')
    token = authorization.split(' ', 1)[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get('sub')
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail='Invalid token')
    user = await db.users.find_one({'_id': user_id})
    if not user:
        raise HTTPException(status_code=401, detail='User not found')
    return user


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if not user.get('is_admin'):
        raise HTTPException(status_code=403, detail='Admin access required')
    return user


async def add_notification(user_id: str, ntype: str, title: str, body: str = '', file_id: str = None):
    n = {
        '_id': str(uuid.uuid4()),
        'userId': user_id,
        'type': ntype,
        'title': title,
        'body': body,
        'fileId': file_id,
        'read': False,
        'createdAt': now_iso(),
    }
    await db.notifications.insert_one(n)


# ---------- Auth Routes ----------
@api_router.post("/auth/register")
async def register(data: RegisterIn):
    existing = await db.users.find_one({'email': data.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail='Email already registered')
    if len(data.password) < 6:
        raise HTTPException(status_code=400, detail='Password must be at least 6 characters')
    is_admin = data.email.lower() == ADMIN_EMAIL
    user = {
        '_id': str(uuid.uuid4()),
        'email': data.email.lower(),
        'password': hash_password(data.password),
        'firstName': data.firstName,
        'lastName': data.lastName,
        'company': data.company or '',
        'phone': data.phone or '',
        'country': data.country or '',
        'vatNumber': data.vatNumber or '',
        'credits': 0,
        'is_admin': is_admin,
        'language': 'en',
        'createdAt': now_iso(),
    }
    await db.users.insert_one(user)
    token = create_token(user['_id'])
    return {'token': token, 'user': public_user(user)}


@api_router.post("/auth/login")
async def login(data: LoginIn):
    user = await db.users.find_one({'email': data.email.lower()})
    if not user or not verify_password(data.password, user['password']):
        raise HTTPException(status_code=401, detail='Invalid email or password')
    # Auto-promote admin email
    if user['email'] == ADMIN_EMAIL and not user.get('is_admin'):
        await db.users.update_one({'_id': user['_id']}, {'$set': {'is_admin': True}})
        user['is_admin'] = True
    token = create_token(user['_id'])
    return {'token': token, 'user': public_user(user)}


@api_router.get("/auth/me")
async def me(user=Depends(get_current_user)):
    return public_user(user)


@api_router.patch("/auth/me")
async def update_me(data: UpdateProfileIn, user=Depends(get_current_user)):
    update = {k: v for k, v in data.dict().items() if v is not None}
    if update:
        await db.users.update_one({'_id': user['_id']}, {'$set': update})
    new_user = await db.users.find_one({'_id': user['_id']})
    return public_user(new_user)


@api_router.post("/auth/change-password")
async def change_password(data: ChangePasswordIn, user=Depends(get_current_user)):
    if not verify_password(data.currentPassword, user['password']):
        raise HTTPException(status_code=400, detail='Current password is incorrect')
    if len(data.newPassword) < 6:
        raise HTTPException(status_code=400, detail='Password must be at least 6 characters')
    await db.users.update_one({'_id': user['_id']}, {'$set': {'password': hash_password(data.newPassword)}})
    return {'success': True}


# ---------- Files Routes ----------
@api_router.post("/files")
async def upload_file(
    file: UploadFile = File(...),
    vehicle: str = Form(...),
    ecu: str = Form(...),
    tuningOptions: str = Form(''),  # comma-separated
    credits: int = Form(...),
    note: str = Form(''),
    user=Depends(get_current_user),
):
    if user.get('credits', 0) < credits:
        raise HTTPException(status_code=400, detail='Not enough credits')

    file_id = str(uuid.uuid4())
    safe_name = f"{file_id}_{Path(file.filename).name}"
    path = UPLOAD_DIR / safe_name
    with open(path, 'wb') as buf:
        shutil.copyfileobj(file.file, buf)

    options_list = [o.strip() for o in tuningOptions.split(',') if o.strip()]

    doc = {
        '_id': file_id,
        'userId': user['_id'],
        'userEmail': user['email'],
        'userName': f"{user.get('firstName','')} {user.get('lastName','')}".strip(),
        'fileName': file.filename,
        'vehicle': vehicle,
        'ecu': ecu,
        'tuningOptions': options_list,
        'status': 'pending',
        'credits': credits,
        'note': note,
        'uploadedAt': now_iso(),
        'completedAt': None,
        'originalPath': str(path),
        'tunedPath': None,
        'tunedFileName': None,
    }
    await db.files.insert_one(doc)

    # Deduct credits
    await db.users.update_one({'_id': user['_id']}, {'$inc': {'credits': -credits}})
    await db.transactions.insert_one({
        '_id': str(uuid.uuid4()),
        'userId': user['_id'],
        'type': 'usage',
        'amount': -credits,
        'fileId': file_id,
        'date': now_iso(),
    })
    # Notify admins
    async for adm in db.users.find({'is_admin': True}):
        await add_notification(adm['_id'], 'new_file', 'New file submitted', f"{user['email']} uploaded {file.filename}", file_id)

    return public_file(doc)


@api_router.get("/files")
async def list_files(user=Depends(get_current_user)):
    cursor = db.files.find({'userId': user['_id']}).sort('uploadedAt', -1)
    items = [public_file(f) async for f in cursor]
    return items


@api_router.get("/files/{file_id}")
async def get_file(file_id: str, user=Depends(get_current_user)):
    f = await db.files.find_one({'_id': file_id})
    if not f:
        raise HTTPException(status_code=404, detail='File not found')
    if f['userId'] != user['_id'] and not user.get('is_admin'):
        raise HTTPException(status_code=403, detail='Forbidden')
    return public_file(f)


@api_router.get("/files/{file_id}/download/original")
async def download_original(file_id: str, user=Depends(get_current_user)):
    f = await db.files.find_one({'_id': file_id})
    if not f:
        raise HTTPException(status_code=404)
    if f['userId'] != user['_id'] and not user.get('is_admin'):
        raise HTTPException(status_code=403)
    if not f.get('originalPath') or not Path(f['originalPath']).exists():
        raise HTTPException(status_code=404, detail='Original file missing')
    return FileResponse(f['originalPath'], filename=f['fileName'])


@api_router.get("/files/{file_id}/download/tuned")
async def download_tuned(file_id: str, user=Depends(get_current_user)):
    f = await db.files.find_one({'_id': file_id})
    if not f:
        raise HTTPException(status_code=404)
    if f['userId'] != user['_id'] and not user.get('is_admin'):
        raise HTTPException(status_code=403)
    if not f.get('tunedPath') or not Path(f['tunedPath']).exists():
        raise HTTPException(status_code=404, detail='Tuned file not yet available')
    return FileResponse(f['tunedPath'], filename=f.get('tunedFileName') or 'tuned.bin')


# ---------- Messages ----------
@api_router.get("/files/{file_id}/messages")
async def get_messages(file_id: str, user=Depends(get_current_user)):
    f = await db.files.find_one({'_id': file_id})
    if not f:
        raise HTTPException(status_code=404)
    if f['userId'] != user['_id'] and not user.get('is_admin'):
        raise HTTPException(status_code=403)
    cursor = db.messages.find({'fileId': file_id}).sort('createdAt', 1)
    items = []
    async for m in cursor:
        items.append({
            'id': m['_id'],
            'fileId': m['fileId'],
            'senderId': m['senderId'],
            'senderName': m.get('senderName', ''),
            'senderRole': m.get('senderRole', 'user'),
            'content': m['content'],
            'createdAt': m['createdAt'],
        })
    return items


@api_router.post("/files/{file_id}/messages")
async def post_message(file_id: str, data: MessageIn, user=Depends(get_current_user)):
    f = await db.files.find_one({'_id': file_id})
    if not f:
        raise HTTPException(status_code=404)
    if f['userId'] != user['_id'] and not user.get('is_admin'):
        raise HTTPException(status_code=403)
    msg = {
        '_id': str(uuid.uuid4()),
        'fileId': file_id,
        'senderId': user['_id'],
        'senderName': f"{user.get('firstName','')} {user.get('lastName','')}".strip() or user['email'],
        'senderRole': 'admin' if user.get('is_admin') else 'user',
        'content': data.content,
        'createdAt': now_iso(),
    }
    await db.messages.insert_one(msg)
    # Notify the other party
    if user.get('is_admin'):
        await add_notification(f['userId'], 'new_message', 'New message from support', data.content[:80], file_id)
    else:
        async for adm in db.users.find({'is_admin': True}):
            await add_notification(adm['_id'], 'new_message', f'New message from {user["email"]}', data.content[:80], file_id)
    return {
        'id': msg['_id'], 'fileId': file_id, 'senderId': user['_id'],
        'senderName': msg['senderName'], 'senderRole': msg['senderRole'],
        'content': msg['content'], 'createdAt': msg['createdAt'],
    }


# ---------- Credits ----------
@api_router.get("/credits/packages")
async def credit_packages():
    return [{'id': k, **v} for k, v in CREDIT_PACKAGES.items()]


@api_router.post("/credits/purchase")
async def purchase_credits(data: PurchaseIn, user=Depends(get_current_user)):
    pkg = CREDIT_PACKAGES.get(data.packageId)
    if not pkg:
        raise HTTPException(status_code=400, detail='Invalid package')
    await db.users.update_one({'_id': user['_id']}, {'$inc': {'credits': pkg['credits']}})
    tx = {
        '_id': str(uuid.uuid4()),
        'userId': user['_id'],
        'type': 'purchase',
        'amount': pkg['credits'],
        'price': pkg['price'],
        'method': 'Multisafepay',
        'date': now_iso(),
    }
    await db.transactions.insert_one(tx)
    new_user = await db.users.find_one({'_id': user['_id']})
    return {'user': public_user(new_user), 'transaction': {**tx, 'id': tx['_id']}}


@api_router.get("/credits/transactions")
async def list_transactions(user=Depends(get_current_user)):
    cursor = db.transactions.find({'userId': user['_id']}).sort('date', -1)
    items = []
    async for t in cursor:
        items.append({
            'id': t['_id'], 'type': t['type'], 'amount': t['amount'],
            'price': t.get('price'), 'method': t.get('method'),
            'fileId': t.get('fileId'), 'date': t['date'],
        })
    return items


# ---------- Notifications ----------
@api_router.get("/notifications")
async def list_notifications(user=Depends(get_current_user)):
    cursor = db.notifications.find({'userId': user['_id']}).sort('createdAt', -1).limit(50)
    items = []
    async for n in cursor:
        items.append({
            'id': n['_id'], 'type': n['type'], 'title': n['title'],
            'body': n.get('body', ''), 'fileId': n.get('fileId'),
            'read': n.get('read', False), 'createdAt': n['createdAt'],
        })
    return items


@api_router.post("/notifications/read-all")
async def read_all_notifications(user=Depends(get_current_user)):
    await db.notifications.update_many({'userId': user['_id'], 'read': False}, {'$set': {'read': True}})
    return {'success': True}


# ---------- Admin Routes ----------
@api_router.get("/admin/users")
async def admin_list_users(admin=Depends(require_admin)):
    cursor = db.users.find({}).sort('createdAt', -1)
    return [public_user(u) async for u in cursor]


@api_router.patch("/admin/users/{user_id}/credits")
async def admin_adjust_credits(user_id: str, data: CreditsAdjustIn, admin=Depends(require_admin)):
    user = await db.users.find_one({'_id': user_id})
    if not user:
        raise HTTPException(status_code=404)
    await db.users.update_one({'_id': user_id}, {'$inc': {'credits': data.amount}})
    await db.transactions.insert_one({
        '_id': str(uuid.uuid4()),
        'userId': user_id,
        'type': 'adjustment',
        'amount': data.amount,
        'method': f"Admin: {data.reason or 'manual adjustment'}",
        'date': now_iso(),
    })
    await add_notification(user_id, 'credits_changed',
                          f"Credits {'added' if data.amount > 0 else 'removed'}",
                          f"{data.amount:+d} credits by admin")
    new_user = await db.users.find_one({'_id': user_id})
    return public_user(new_user)


@api_router.get("/admin/files")
async def admin_list_all_files(admin=Depends(require_admin), status_filter: Optional[str] = None):
    q = {}
    if status_filter and status_filter != 'all':
        q['status'] = status_filter
    cursor = db.files.find(q).sort('uploadedAt', -1)
    return [public_file(f) async for f in cursor]


@api_router.patch("/admin/files/{file_id}/status")
async def admin_update_status(file_id: str, data: StatusUpdateIn, admin=Depends(require_admin)):
    valid = ['pending', 'in_progress', 'completed', 'rejected']
    if data.status not in valid:
        raise HTTPException(status_code=400, detail='Invalid status')
    f = await db.files.find_one({'_id': file_id})
    if not f:
        raise HTTPException(status_code=404)
    update = {'status': data.status}
    if data.status == 'completed':
        update['completedAt'] = now_iso()
    await db.files.update_one({'_id': file_id}, {'$set': update})
    await add_notification(f['userId'], 'status_changed',
                          f"File status: {data.status}",
                          f"{f['fileName']} is now {data.status}", file_id)
    new_f = await db.files.find_one({'_id': file_id})
    return public_file(new_f)


@api_router.post("/admin/files/{file_id}/upload-tuned")
async def admin_upload_tuned(file_id: str, file: UploadFile = File(...), admin=Depends(require_admin)):
    f = await db.files.find_one({'_id': file_id})
    if not f:
        raise HTTPException(status_code=404)
    safe_name = f"tuned_{file_id}_{Path(file.filename).name}"
    path = UPLOAD_DIR / safe_name
    with open(path, 'wb') as buf:
        shutil.copyfileobj(file.file, buf)
    await db.files.update_one({'_id': file_id}, {'$set': {
        'tunedPath': str(path),
        'tunedFileName': file.filename,
        'status': 'completed',
        'completedAt': now_iso(),
    }})
    await add_notification(f['userId'], 'file_completed',
                          'Your tuned file is ready!',
                          f"{f['fileName']} has been tuned and is ready for download.", file_id)
    new_f = await db.files.find_one({'_id': file_id})
    return public_file(new_f)


@api_router.get("/admin/stats")
async def admin_stats(admin=Depends(require_admin)):
    total_users = await db.users.count_documents({})
    total_files = await db.files.count_documents({})
    pending = await db.files.count_documents({'status': 'pending'})
    in_progress = await db.files.count_documents({'status': 'in_progress'})
    completed = await db.files.count_documents({'status': 'completed'})
    return {
        'totalUsers': total_users,
        'totalFiles': total_files,
        'pending': pending,
        'inProgress': in_progress,
        'completed': completed,
    }


@api_router.get("/")
async def root():
    return {"message": "Fast Chiptuningfiles API", "version": "1.0"}


# Seed admin user on startup
@app.on_event("startup")
async def seed_admin():
    existing = await db.users.find_one({'email': ADMIN_EMAIL})
    if not existing:
        admin_user = {
            '_id': str(uuid.uuid4()),
            'email': ADMIN_EMAIL,
            'password': hash_password('admin1234'),
            'firstName': 'Admin',
            'lastName': 'User',
            'company': 'Fast Chiptuningfiles',
            'phone': '',
            'country': 'Netherlands',
            'vatNumber': '',
            'credits': 9999,
            'is_admin': True,
            'language': 'en',
            'createdAt': now_iso(),
        }
        await db.users.insert_one(admin_user)
        logging.info(f"Seeded admin user: {ADMIN_EMAIL} / admin1234")


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
