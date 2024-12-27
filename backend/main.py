from fastapi import FastAPI, Depends, HTTPException,status,Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from database import get_db,Base
from models import UserInDbORM
from schemas import *
import jwt
from passlib.context import CryptContext
from datetime import timedelta,datetime     


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend origin
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

SECRET_KEY = "8===>"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


pwd_context = CryptContext(['bcrypt'], deprecated= 'auto')
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login_for_access_token")

def get_password_hash(password: str):
    return pwd_context.hash(password)

def get_user_from_db(username:str, db:Session):
    user = db.query(UserInDbORM).filter(UserInDbORM.username == username).first()
    return user

def verify_password(hashed_password: str, input_password: str):
    return pwd_context.verify(input_password, hashed_password)

def authenticate_user(username: str, password: str, db: Session):
    user = get_user_from_db(username,db)
    if not user:
        return False
    if not verify_password(user.password, password):
        return False
    return user

def create_access_token(data:dict, expires_delta: timedelta or None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm =ALGORITHM )
    return encoded_jwt

@app.post('/login_for_access_token')
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db) ):
    user = authenticate_user(form_data.username, form_data.password, db)
    
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail='Incorrect username or password',
                            headers={"WWW-Authenticate": "Bearer"})

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    access_token = create_access_token(data = {"sub":user.username}, expires_delta = access_token_expires)

    return {"access_token":access_token, "token_type":"bearer","role":user.role }

@app.post('/create_account', status_code=status.HTTP_201_CREATED)
async def create_account(username: str = Form(...),
                         password: str = Form(...),
                         db: Session = Depends(get_db)):

    if db.query(UserInDbORM).filter(username == UserInDbORM.username).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Username already used!')

    hashed_password = get_password_hash(password)

    new_user = UserInDbORM(
        username = username,
        password = hashed_password,
        role = 1
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return JSONResponse(status_code= status.HTTP_201_CREATED, content= {"message":"user registered successfully"})

