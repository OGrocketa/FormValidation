from pydantic import BaseModel
from typing import Optional

class UserInDB(BaseModel):
    username: str
    password: str
    role: int = 1
    access_token: Optional[str] = None

class User(UserInDB):
    password_confirm: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str

