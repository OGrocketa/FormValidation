from fastapi import FastAPI, Depends, HTTPException,status,Form, Request, Response
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
REFRESH_TOKEN_EXPIRE_DAYS = 7



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
async def login_for_access_token(response: Response, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db) ):
    user = authenticate_user(form_data.username, form_data.password, db)

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail='Incorrect username or password',
                            headers={"WWW-Authenticate": "Bearer"})

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)

    access_token = create_access_token(data = {"sub":user.username}, expires_delta = access_token_expires)
    refresh_token = create_access_token(data={"sub":user.username}, expires_delta = refresh_token_expires)

    user.access_token = access_token
    db.add(user)
    db.commit()

    response.set_cookie(
        key="refresh_token",
        value= refresh_token,
        httponly = True,
        secure = True,
        samesite = "none",
    )

    return {"access_token":access_token, "role": user.role }

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

@app.get('/users')
async def get_users(request:Request, db: Session = Depends(get_db)):
    pass

@app.get('/refresh',response_model= Token)
async def refresh(request: Request, response: Response, db: Session= Depends(get_db)):
    refresh_token = request.cookies.get("refresh_token")

    if not refresh_token:
        raise HTTPException(status_code= status.HTTP_401_UNAUTHORIZED, detail="Refresh token missing")
    
    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms= [ALGORITHM])
        username = payload.get("sub")

        if not username:
            raise HTTPException(status_code= status.HTTP_401_UNAUTHORIZED,detail="Invalid token username is missing")
        
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user = db.query(UserInDbORM).filter(username == UserInDbORM.username).first()

    if not user:
        raise HTTPException(status_code = status.HTTP_401_UNAUTHORIZED, detail= "User not found")

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token({"sub":user.username}, access_token_expires)

    user.access_token = access_token
    db.add(user)
    db.commit()
    

    return {"access_token": access_token, "token_type":"bearer"}