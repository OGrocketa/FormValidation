from pydantic import BaseModel

class UserInDB(BaseModel):
    username: str
    password: str
    role: int = 1
    access_token: str

class User(UserInDB):
    password_confirm: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str

