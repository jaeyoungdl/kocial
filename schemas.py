#schemas.py
from pydantic import BaseModel, Field
from typing import Optional
from datetime import date
from datetime import datetime
from decimal import Decimal
class Issue(BaseModel):
    topic_id: str
    kwd_rank: int
    topic_iss_kwd: str

    class Config:
        orm_mode = True

class MonthlyIssue(BaseModel):
    month: str
    count: int

class MemberCreate(BaseModel):
    u_id: str
    u_pw: str
    u_name: str
    u_add: str
    u_email: str
    u_tel: str

class Member(BaseModel):
    u_id: str
    u_name: str
    u_email: str
    u_add: str
    u_tel: str
    u_yn: int

    class Config:
        orm_mode = True

class IdAvailability(BaseModel):
    available: bool
    message: str

class LoginRequest(BaseModel):
    u_id: str
    u_pw: str


class WordRank(BaseModel):
    word: str
    count: int
    rank: int

class TopWords(BaseModel):
    country: str
    words: list[WordRank]


class TopicBase(BaseModel):
    topic_id: str
    word: str

class Topic(TopicBase):
    id: int

    class Config:
        orm_mode = True

class SummarizeRequest(BaseModel):
    country: str

class SummarizeResponse(BaseModel):
    summary: str

class LoginRequest(BaseModel):
    u_id: str = Field(..., min_length=1)
    u_pw: str = Field(..., min_length=1)

class HistoryBase(BaseModel):
    topic_num: str
    date: date
    main_kwd: str
    frequency: int
    num: int
    words: str
    country: str

class HistoryCreate(HistoryBase):
    pass

class History(HistoryBase):
    id: int

    class Config:
        orm_mode = True

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str
    u_id: str


class KeywordRequest(BaseModel):
    keyword: str

class KeywordAnalysisResult(BaseModel):
    country: str
    kwd_cnt: int
    title: str
    sentence: str


class PossibilityRequest(BaseModel):
    keyword: str
    user_id: str
class PossibilityAnalysisResult(BaseModel):
    analysis: str

class LogCreate(BaseModel):
    u_id: str
    keyword: str
    analysis_data: str

class Log(LogCreate):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

class PaymentCreate(BaseModel):
    u_id: str
    amount: Decimal

class Payment(PaymentCreate):
    payment_id: int
    payment_date: datetime
    is_used: bool

    class Config:
        orm_mode = True



class KakaoUser(BaseModel):
    email: str
    nickname: str