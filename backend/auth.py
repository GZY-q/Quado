from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import os
import hashlib
import bcrypt
import models, schemas

# Secret key to encode the JWT token
SECRET_KEY = os.environ.get("SECRET_KEY", "a_very_secret_key_for_development_only")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30 * 24 * 60 # 30 days

def get_password_hash(password: str) -> str:
    # 1. 预先进行一次 SHA-256 哈希，将任意长度密码转为固定 64 字符
    # 2. 这样可以绕过 bcrypt 的 72 字节限制，且依然保证安全性
    password_sha = hashlib.sha256(password.encode("utf-8")).hexdigest()
    
    # 3. 使用 bcrypt 进行加密
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_sha.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        # 对输入的原始密码进行同样的 SHA-256 处理
        password_sha = hashlib.sha256(plain_password.encode("utf-8")).hexdigest()
        
        # 验证 bcrypt
        return bcrypt.checkpw(password_sha.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False

def get_user(db, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(username=user.username, email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db, username: str, password: str):
    user = get_user(db, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
