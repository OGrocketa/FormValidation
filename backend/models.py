from sqlalchemy import String,Column,Integer
from database import Base

class UserInDbORM(Base):
    __tablename__ = "test"
    username = Column(String(255),primary_key= True)
    password = Column(String(255))
    role = Column(Integer, default=1)  