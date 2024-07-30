#models.py
from sqlalchemy import Column, Integer, String, CHAR, Date, Text, JSON, TIMESTAMP,DECIMAL, Boolean
from sqlalchemy.sql import func
from database import Base

class Member(Base):
    __tablename__ = "tbl_member"

    u_id = Column(String(50), primary_key=True, index=True)
    u_pw = Column(String(255), nullable=False)
    u_name = Column(String(100), nullable=False)
    u_add = Column(String(255))
    u_email = Column(String(100), nullable=False)
    u_tel = Column(String(100))
    u_yn = Column(Integer, default=0, nullable=False)

class Topic(Base):
    __tablename__ = "tbl_topic"

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(String, index=True)
    word = Column(String)

class History(Base):
    __tablename__ = "tbl_history"

    id = Column(Integer, primary_key=True, index=True)
    topic_num = Column(String(255), nullable=False)
    date = Column(Date, nullable=False)
    main_kwd = Column(String(255), nullable=False)
    frequency = Column(Integer, nullable=False)
    num = Column(Integer, nullable=False)
    words = Column(Text, nullable=False)
    country = Column(String(20), nullable=False)

class Log(Base):
    __tablename__ = "tbl_log"

    id = Column(Integer, primary_key=True, index=True)
    u_id = Column(String(255), nullable=False)
    keyword = Column(String(100), nullable=False)
    analysis_data = Column(JSON, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())

class PaymentInfo(Base):
    __tablename__ = "payment_info"

    payment_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    u_id = Column(String(255), nullable=False)
    amount = Column(DECIMAL(10, 2), nullable=False)
    payment_date = Column(TIMESTAMP, server_default=func.now())
    is_used = Column(Boolean, default=False)