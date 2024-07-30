# crud.py
from sqlalchemy.orm import Session
import models, schemas
from passlib.context import CryptContext
from sqlalchemy import func
from collections import Counter
from sqlalchemy import text
import re
import json
from sqlalchemy import and_
import secrets
import string
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_log(db: Session, log: schemas.LogCreate):
    db_log = models.Log(**log.dict())
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log


def get_taiwan_issues(db: Session, limit: int = 825):
    return db.query(models.Issue).filter(models.Issue.topic_id.like("%대만%")).limit(limit).all()

def get_member(db: Session, u_id: str):
    return db.query(models.Member).filter(models.Member.u_id == u_id).first()



# 회원가입
def create_member(db: Session, member: schemas.MemberCreate):
    hashed_password = pwd_context.hash(member.u_pw)
    db_member = models.Member(
        u_id=member.u_id,
        u_pw=hashed_password,
        u_name=member.u_name,
        u_add=member.u_add,
        u_email=member.u_email,
        u_tel=member.u_tel,
        u_yn= 0
    )
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    return db_member

def check_id_availability(db: Session, u_id: str):
    existing_user = db.query(models.Member).filter(models.Member.u_id == u_id).first()
    if existing_user:
        return {"available": False, "message": "이미 사용 중인 아이디입니다."}
    return {"available": True, "message": "사용 가능한 아이디입니다."}


def authenticate_user(db: Session, u_id: str, password: str):
    user = get_member(db, u_id=u_id)
    if not user:
        return None
    if not pwd_context.verify(password, user.u_pw):
        print(f"Password verification failed for user: {u_id}")  # 로깅 추가
        return None
    return user


def get_or_create_user(db: Session, email: str, name: str, google_id: str):
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        user = models.User(email=email, name=name, google_id=google_id)
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

def get_top_words(db: Session, country: str, limit: int = 10):
    # 최근 3개월 데이터 가져오기
    recent_months = ['2406', '2405', '2404']
    
    # 해당 국가와 topic_id에서 연도와 월을 추출하기 위한 정규 표현식 패턴
    pattern = re.compile(rf"{country}_(\d{{4}})")

    # 해당 국가와 최근 3개월 데이터 필터링
    topics = db.query(models.Topic).filter(
        models.Topic.topic_id.like(f"%{country}%")
    ).all()

    filtered_topics = [
        topic for topic in topics
        if pattern.search(topic.topic_id) and pattern.search(topic.topic_id).group(1) in recent_months
    ]

    # 단어 빈도수 계산
    word_counter = Counter(topic.word for topic in filtered_topics)
    
    # 상위 단어 추출 및 랭킹 부여
    top_words = word_counter.most_common(limit)
    ranked_words = [
        {"word": word, "count": count, "rank": rank + 1}
        for rank, (word, count) in enumerate(top_words)
    ]

    return ranked_words

def get_country_data(db: Session, country: str):
    query = text("""
    SELECT topic_id, word
    FROM tbl_topic
    WHERE topic_id LIKE :country_prefix
    AND SUBSTRING_INDEX(SUBSTRING_INDEX(topic_id, '_', 2), '_', -1) IN ('2406', '2405', '2404')
    ORDER BY topic_id
    """)
    
    result = db.execute(query, {"country_prefix": f"{country}_%"})
    
    data = [f"{row.topic_id} {row.word} " for row in result]
    return "\n".join(data)


def get_history_data(db: Session, country: str):
    return db.query(models.History).filter(func.lower(models.History.country) == func.lower(country)).all()

def create_history_data(db: Session, item: schemas.HistoryCreate):
    db_item = models.History(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def get_top_word(db: Session, country: str, limit: int = 10):
    # 최근 3개월 데이터 가져오기
    recent_months = ['2406', '2405', '2404']
    
    # 해당 국가와 topic_id에서 연도와 월을 추출하기 위한 정규 표현식 패턴
    pattern = re.compile(rf"{country}_(\d{{4}})")

    # 해당 국가와 최근 3개월 데이터 필터링
    topics = db.query(models.Topic).filter(
        models.Topic.topic_id.like(f"%{country}%")
    ).all()

    filtered_topics = [
        topic for topic in topics
        if pattern.search(topic.topic_id) and pattern.search(topic.topic_id).group(1) in recent_months
    ]

    # 단어 빈도수 계산
    word_counter = Counter(topic.word for topic in filtered_topics)
    
    # 상위 단어 추출 및 랭킹 부여
    top_words = word_counter.most_common(limit)

    # 단어와 빈도수만 추출한 리스트 생성
    result = [{"word": word, "count": count} for word, count in top_words]

    return result





def update_user_password(db: Session, u_id: str, new_hashed_password: str):
    user = get_member(db, u_id)
    if user:
        user.u_pw = new_hashed_password
        db.commit()
        db.refresh(user)
    return user

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def analyze_keyword(df, kiwi, keyword):
    try:
        filtered_df = df[df.sentence.str.contains(f'{keyword}', na=False)].reset_index(drop=True)
        
        nation_cnt = filtered_df['country'].value_counts().to_dict()
        
        result_df = filtered_df[~filtered_df['country'].duplicated(keep='first')].reset_index(drop=True)
        
        result_df['sentence'] = result_df.sentence.apply(lambda x: ('\n'.join(sentence.text for sentence in kiwi.split_into_sents(x) if keyword in sentence.text)))
        
        result_df['kwd_cnt'] = result_df['country'].map(nation_cnt)
        
        results = result_df[['country', 'kwd_cnt', 'title', 'sentence']].to_dict(orient='records')
        
        return [schemas.KeywordAnalysisResult(**result) for result in results]
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def create_payment(db: Session, payment: schemas.PaymentCreate):
    db_payment = models.PaymentInfo(**payment.dict(), is_used=False)
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment

def get_unused_payments(db: Session, u_id: str):
    return db.query(models.PaymentInfo).filter(
        and_(
            models.PaymentInfo.u_id == u_id,
            models.PaymentInfo.is_used == False
        )
    ).all()

def use_payment(db: Session, payment_id: int):
    db_payment = db.query(models.PaymentInfo).filter(models.PaymentInfo.payment_id == payment_id).first()
    if db_payment and not db_payment.is_used:
        db_payment.is_used = True
        db.commit()
        return True
    return False


def generate_temporary_password():
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for i in range(16))

def get_or_create_kakao_user(db: Session, email: str, nickname: str, name: str, phone_number: str):
    user = db.query(models.Member).filter(models.Member.u_email == email).first()
    if not user:
        temp_password = generate_temporary_password()
        hashed_password = pwd_context.hash(temp_password)
        
        user = models.Member(
            u_id=email,  # 카카오 사용자의 고유 ID 생성
            u_email=email,
            u_name=name,
            u_pw=hashed_password,  # 임시 비밀번호 해시
            u_add="카카오 로그인으로 가입 (주소 미제공)",  # 기본 주소 값
            u_tel=phone_number,
            u_yn=1  # 카카오 로그인 사용자 표시
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
    return user