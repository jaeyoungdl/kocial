# main.py
from fastapi import FastAPI, HTTPException, Depends, Query,Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from typing import List
import crud
from database import SessionLocal, engine
import models, schemas
from fastapi.middleware.cors import CORSMiddleware
from urllib.parse import unquote, urlencode
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from transformers import GPT2TokenizerFast
from langchain_community.document_loaders.csv_loader import CSVLoader
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain.chains import RetrievalQA
from langchain.schema import Document
import os
from sklearn.feature_extraction.text import TfidfTransformer
from sklearn.feature_extraction.text import CountVectorizer
import numpy as np
from kiwipiepy import Kiwi
import pandas as pd
from openai import OpenAIError
import schemas
from collections import Counter
import logging
from decimal import Decimal
from sqlalchemy import func
from models import PaymentInfo
import json
import requests
from models import Log
# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


models.Base.metadata.create_all(bind=engine)
load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://192.168.219.55:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Google OAuth2 클라이언트 ID
GOOGLE_CLIENT_ID = "908838635383-s5sp1fjminu0s4fmatltv9fhc4bbvs34.apps.googleusercontent.com"

model = ChatOpenAI(model="gpt-4o", openai_api_key=os.getenv("OPENAI_API_KEY"))

# API 키 확인
if not os.getenv("OPENAI_API_KEY"):
    raise ValueError("OPENAI_API_KEY is not set in the environment variables")


@app.post("/signup", response_model=schemas.Member)
def signup(member: schemas.MemberCreate, db: Session = Depends(get_db)):
    db_member = crud.get_member(db, u_id=member.u_id)
    if db_member:
        raise HTTPException(status_code=400, detail="User already registered")
    return crud.create_member(db=db, member=member)

@app.post("/login")
def login(login_data: schemas.LoginRequest, db: Session = Depends(get_db)):
    print(f"Login attempt for user: {login_data.u_id}")  # 로깅 추가
    if not login_data.u_id or not login_data.u_pw:
        raise HTTPException(status_code=400, detail="Username and password are required")
    
    user = crud.authenticate_user(db, login_data.u_id, login_data.u_pw)
    if not user:
        print(f"Login failed for user: {login_data.u_id}")  # 로깅 추가
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    
    print(f"Login successful for user: {login_data.u_id}")  # 로깅 추가
    return {"message": "Login successful", "user": {"u_id": user.u_id, "u_name": user.u_name}}

@app.get("/check-id/{u_id}", response_model=schemas.IdAvailability)
def check_id_availability(u_id: str, db: Session = Depends(get_db)):
    return crud.check_id_availability(db, u_id)

@app.post("/analyze_possibility", response_model=schemas.PossibilityAnalysisResult)
async def analyze_possibility(request: schemas.PossibilityRequest, mysql_db: Session = Depends(get_db)):
    try:
        # 사용 가능한 이용권 확인
        unused_payments = crud.get_unused_payments(mysql_db, request.user_id)
        if not unused_payments:
            raise HTTPException(status_code=402, detail="No available tickets. Please purchase a ticket.")

        # 가장 오래된 미사용 이용권 선택
        payment_to_use = unused_payments[0]

        def get_country_keywords(filtered_data, country, n=4):
            # 해당 국가의 데이터만 필터링
            country_data = filtered_data[filtered_data['country'] == country]
            
            # trnk_kwd 컬럼의 모든 키워드를 하나의 리스트로 합치기
            all_keywords = ' '.join(country_data['trnk_kwd']).split()
            
            # 가장 빈번한 키워드 추출
            keyword_counts = Counter(all_keywords)
            top_keywords = [keyword for keyword, _ in keyword_counts.most_common(n)]
            
            return top_keywords

        

        keyword = request.keyword
        df = pd.read_csv('./Possibility_data.csv')
        # 키워드로 데이터 필터링
        filtered_data = df[df.sentence.str.contains(keyword, na=False)].reset_index(drop=True)
        if filtered_data.empty:
            raise HTTPException(status_code=404, detail=f"No data found for the keyword: {keyword}")

        filtered_data = filtered_data.iloc[:,[0,1,2,5,-1]]

        # DataFrame을 Document 객체 리스트로 변환
        documents = [
            Document(
                page_content=row['content'],
                metadata={'country': row['country'], 'title': row['title']}
            ) for _, row in filtered_data.iterrows()
        ]

        # 텍스트 분할
        splitter = CharacterTextSplitter(separator="\n", chunk_size=1000, chunk_overlap=0, length_function=len)
        split_documents = splitter.split_documents(documents)

        # 국가별 문서 수 계산
        country_doc_counts = Counter([doc.metadata['country'] for doc in documents])

        # 국가별 키워드 추출
        # 메인 코드
        country_keywords = {}
        countries = ["베트남", "태국", "말레이시아", "인도네시아", "대만"]

        for country in countries:
            country_keywords[country] = get_country_keywords(filtered_data, country)

        embeddings_model = OpenAIEmbeddings()

        # FAISS 데이터베이스 생성
        db = FAISS.from_documents(documents, embeddings_model)
        # 질문 생성
        question = f"""
            다음 정보를 바탕으로 키워드 '{keyword}'의 각 국가에서의 성공 가능성을 분석해주세요.

            분석 대상 국가: 베트남, 태국, 말레이시아, 인도네시아, 대만

            각 국가별 문서 수:
            {', '.join([f"{country}: {count}" for country, count in country_doc_counts.items()])}

            각 국가별 관련 키워드:
            {', '.join([f"{country}: {', '.join(keywords)}" for country, keywords in country_keywords.items()])}

            분석 결과를 다음과 같은 JSON 형식으로 제공해주세요:

            {{
            "countries": {{
                "대만": {{
                "keywords": ["키워드1", "키워드2", "키워드3", "키워드4"],
                "localization": "현지화 정도에 대한 설명",
                "marketPotential": "시장 잠재력에 대한 설명"
                }},
                "베트남": {{
                "keywords": ["키워드1", "키워드2", "키워드3", "키워드4"],
                "localization": "현지화 정도에 대한 설명",
                "marketPotential": "시장 잠재력에 대한 설명"
                }},
                "태국": {{
                "keywords": ["키워드1", "키워드2", "키워드3", "키워드4"],
                "localization": "현지화 정도에 대한 설명",
                "marketPotential": "시장 잠재력에 대한 설명"
                }},
                "말레이시아": {{
                "keywords": ["키워드1", "키워드2", "키워드3", "키워드4"],
                "localization": "현지화 정도에 대한 설명",
                "marketPotential": "시장 잠재력에 대한 설명"
                }},
                "인도네시아": {{
                "keywords": ["키워드1", "키워드2", "키워드3", "키워드4"],
                "localization": "현지화 정도에 대한 설명",
                "marketPotential": "시장 잠재력에 대한 설명"
                }}
            }},
            "ratings": {{
                "대만": {{ "관심도": (score), "현지화가능성": (score), "시장잠재력": (score) }},
                "베트남": {{ "관심도": (score), "현지화가능성": (score), "시장잠재력": (score) }},
                "태국": {{ "관심도": (score), "현지화가능성": (score), "시장잠재력": (score) }},
                "말레이시아": {{ "관심도": (score), "현지화가능성": (score), "시장잠재력": (score) }},
                "인도네시아": {{ "관심도": (score), "현지화가능성": (score), "시장잠재력": (score) }}
            }},
            "bestCountry": "최적 진출국 이름",
            "selectionReason": "최적 진출국 선정 이유",
            "entryStrategies": [
                "진출 전략 1",
                "진출 전략 2",
                "진출 전략 3"
            ]
            }}

            주의사항:
            - 객관적인 데이터와 정보에 기반하여 분석해주세요.
            - 각 국가별 keywords에 나오는 키워드 4개는 국가별로 데이터에 있는 키워드로 나오게 해주세요. 나라별로 다똑같으면 안됩니다.
            - 정보가 부족한 경우, 그 사실을 명시해주세요.
            - 국가별 비교 분석을 통해 상대적인 강점과 약점을 파악해주세요.
            - 평가 점수는 입력된 {keyword}가 각 나라별로 관심도, 현지화가능성, 시장잠재력등을 고려해서 1(낮음), 2(중간), 3(높음)중에 가장 알맞은 점수로 표시해주세요.
            - 각 국가의 정보는 제공된 데이터를 기반으로 차별화되어야 합니다.

            분석 결과를 위의 JSON 형식으로 제공해 주세요. 추가적인 설명이나 주석은 필요하지 않습니다.
            """
        
         # LLM 초기화 및 질문-답변 실행
        try:
            llm = ChatOpenAI(model_name="gpt-4o", temperature=0)
            qa_chain = RetrievalQA.from_chain_type(llm, retriever=db.as_retriever())
            result = qa_chain({"query": question})
        except OpenAIError as e:
            raise HTTPException(status_code=500, detail=f"OpenAI API error: {str(e)}")
        
        result = qa_chain({"query": question})
        
        

        if not crud.use_payment(mysql_db, payment_to_use.payment_id):
            raise HTTPException(status_code=400, detail="Failed to use the ticket. Please try again.")

        # 로그 생성
        log_data = schemas.LogCreate(
            u_id=request.user_id,
            keyword=request.keyword,
            analysis_data=result['result']
        )
        crud.create_log(mysql_db, log_data)

        return schemas.PossibilityAnalysisResult(analysis=result['result'])
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

@app.get("/logs/", response_model=list[schemas.Log])
def read_logs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    logs = crud.get_logs(db, skip=skip, limit=limit)
    return logs

@app.get("/logs/{log_id}", response_model=schemas.Log)
def read_log(log_id: int, db: Session = Depends(get_db)):
    db_log = crud.get_log(db, log_id=log_id)
    if db_log is None:
        raise HTTPException(status_code=404, detail="Log not found")
    return db_log
def get_current_user(u_id: str, db: Session = Depends(get_db)):
    user = crud.get_member(db, u_id=u_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user



@app.post("/change-password")
async def change_password(
    request: Request,
    change_password_data: schemas.ChangePasswordRequest,
    db: Session = Depends(get_db)
):
    request_data = await request.json()  # JSON 요청 본문 읽기
    current_password = request_data.get("current_password")
    new_password = request_data.get("new_password")
    confirm_password = request_data.get("confirm_password")
    u_id = request_data.get("u_id")

    if new_password != confirm_password:
        raise HTTPException(status_code=400, detail="New password and confirmation do not match")

    user = crud.get_member(db, u_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not crud.verify_password(current_password, user.u_pw):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    new_hashed_password = crud.hash_password(new_password)
    crud.update_user_password(db, u_id, new_hashed_password)

    return {"message": "비밀번호 변경완료"}



# '대만'이 포함된 topic_id를 가진 데이터 가져오기
@app.get("/taiwan_issues", response_model=List[schemas.Issue])
def get_taiwan_issues(limit: int = Query(100, ge=1, le=1000), db: Session = Depends(get_db)):
    issues = crud.get_taiwan_issues(db, limit=limit)
    if not issues:
        raise HTTPException(status_code=404, detail="Taiwan issues not found")
    return issues

# 월별 '대만'이 포함된 topic_id를 가진 데이터 그룹화
@app.get("/monthly_taiwan_issues", response_model=List[schemas.MonthlyIssue])
def get_monthly_taiwan_issues(db: Session = Depends(get_db)):
    issues = crud.get_taiwan_issues(db)
    if not issues:
        raise HTTPException(status_code=404, detail="Taiwan issues not found")

    # 월별 데이터 그룹화
    monthly_data = {}
    for issue in issues:
        topic_id_parts = issue.topicid.split('_')
        month = int(topic_id_parts[1])
        year = int(topic_id_parts[0].split('_')[1])
        key = f"{year}-{month}"
        if key not in monthly_data:
            monthly_data[key] = 0
        monthly_data[key] += 1

    # 결과를 MonthlyIssue 형식으로 변환하여 정렬된 리스트로 반환
    sorted_data = [{"month": key, "count": monthly_data[key]} for key in sorted(monthly_data.keys())]
    return sorted_data





@app.get("/top_words/{country}", response_model=schemas.TopWords)
def read_top_words(country: str, limit: int = 10, db: Session = Depends(get_db)):
    decoded_country = unquote(country)  # URL 디코딩
    top_words = crud.get_top_words(db, decoded_country, limit)
    if not top_words:
        raise HTTPException(status_code=404, detail=f"No data found for the country: {decoded_country}")
    return {"country": decoded_country, "words": top_words}




tokenizer = GPT2TokenizerFast.from_pretrained("gpt2")

def split_by_month(data):
    months = {'2406': [], '2405': [], '2404': []}
    for line in data.split('\n'):
        for month in months:
            if month in line:
                months[month].append(line)
                break
    return months

def limit_tokens_per_month(months_data, max_tokens_per_month):
    limited_data = {}
    for month, data in months_data.items():
        tokens = tokenizer.encode('\n'.join(data))
        if len(tokens) > max_tokens_per_month:
            limited_tokens = tokens[:max_tokens_per_month]
            limited_data[month] = tokenizer.decode(limited_tokens)
        else:
            limited_data[month] = '\n'.join(data)
    return limited_data

@app.post("/summarize", response_model=schemas.SummarizeResponse)
async def summarize_data(request: schemas.SummarizeRequest, db: Session = Depends(get_db)):
    country_data = crud.get_country_data(db, request.country)
    
    if not country_data:
        raise HTTPException(status_code=404, detail="No data found for the specified country")
    
    # 데이터를 월별로 분리
    months_data = split_by_month(country_data)
    
    # 각 월별로 토큰 수 제한 (전체 9000 토큰 중 각 월에 3000 토큰 할당)
    max_tokens_per_month = 1000
    limited_data = limit_tokens_per_month(months_data, max_tokens_per_month)
    
    # 제한된 데이터를 다시 하나의 문자열로 결합
    limited_country_data = '\n'.join(limited_data.values())
    
    messages = [
        SystemMessage(content="입력된 데이터를 분석하여 연도와 월별로 주요 이슈를 5줄로 요약해주세요. 또한 달별로 줄바꿈을 해주고 중요한 키워드는 글씨를 굵게 해주세요. 각 데이터의 형식은 '국가_년월_주차_topic_번호 토픽순위 키워드 빈도수' 입니다. 여기서 국가_2406_1_topic_2 이런식으로 나오면 2406은 2024년 06월 1주차 입니다. 참고: 전체 글 수가 공백포함 700자 미만"),
        HumanMessage(content=f"다음 데이터를 분석하여 연도와 월별 주요 이슈를 5줄로 요약해주세요:\n\n{limited_country_data}"),
    ]
    
    result = model.invoke(messages)
    summary = result.content
    
    return schemas.SummarizeResponse(summary=summary)


@app.get("/api/timeseries/{country}")
def get_timeseries_data(country: str, db: Session = Depends(get_db)):
    data = crud.get_history_data(db, country)
    if not data:
        raise HTTPException(status_code=404, detail=f"No data found for country: {country}")
    return [{"date": item.date, "topic_num": item.topic_num, "frequency": item.frequency, "main_kwd": item.main_kwd} for item in data]


@app.get("/api/top_words/{country}")
def read_top_words(country: str, limit: int = 10, db: Session = Depends(get_db)):
    top_words = crud.get_top_word(db, country, limit)
    if not top_words:
        raise HTTPException(status_code=404, detail=f"No data found for the country: {country}")
    return {"country": country, "words": top_words}



# Kiwi 초기화
kiwi = Kiwi()

# 데이터 로드 (애플리케이션 시작 시 한 번만 실행)
df = pd.read_csv('./Possibility_data.csv')

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/analyze_keyword", response_model=List[schemas.KeywordAnalysisResult])
async def analyze_keyword(request: schemas.KeywordRequest):
    return crud.analyze_keyword(df, kiwi, request.keyword)

@app.get("/user_logs/{user_id}")
def get_user_logs(user_id: str, db: Session = Depends(get_db)):
    logs = db.query(models.Log).filter(models.Log.u_id == user_id).order_by(models.Log.created_at.desc()).limit(10).all()
    return [{"id":log.id,"date": log.created_at.strftime("%Y-%m-%d"), "keyword": log.keyword} for log in logs]

@app.post("/save_payment", response_model=schemas.Payment)
async def save_payment(payment: schemas.PaymentCreate, db: Session = Depends(get_db)):
    logger.info(f"Received payment data: {payment}")
    try:
        # 데이터 유효성 검사 및 변환
        payment_data = payment.dict()
        logger.info(f"Payment data after dict(): {payment_data}")
        
        payment_data['amount'] = Decimal(str(payment_data['amount']))
        logger.info(f"Payment data after Decimal conversion: {payment_data}")
        
        # 데이터 저장
        db_payment = crud.create_payment(db=db, payment=schemas.PaymentCreate(**payment_data))
        logger.info(f"Payment saved: {db_payment}")
        return db_payment
    except ValueError as ve:
        logger.error(f"ValueError: {str(ve)}")
        raise HTTPException(status_code=422, detail=f"Invalid amount value: {str(ve)}")
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

@app.get("/user_payment_info/{u_id}")
def get_user_payment_info(u_id: str, db: Session = Depends(get_db)):
    used_count = db.query(func.count(PaymentInfo.payment_id)).filter(
        PaymentInfo.u_id == u_id,
        PaymentInfo.is_used == True
    ).scalar()

    unused_count = db.query(func.count(PaymentInfo.payment_id)).filter(
        PaymentInfo.u_id == u_id,
        PaymentInfo.is_used == False
    ).scalar()

    return {
        "used_count": used_count,
        "unused_count": unused_count
    }


@app.get("/analysis_data/{log_id}")
def get_analysis_data(log_id: int, db: Session = Depends(get_db)):
    log = db.query(Log).filter(Log.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    return {"analysis_data": log.analysis_data}




@app.get("/kakao-login")
async def kakao_login():
    kakao_oauth_url = f"https://kauth.kakao.com/oauth/authorize?client_id=dda96a1a63ca7218188c2bfb063b1a0a&redirect_uri=http://localhost:8000/kakao-callback&response_type=code"
    return RedirectResponse(url=kakao_oauth_url)

@app.get("/kakao-callback")
async def kakao_callback(code: str, db: Session = Depends(get_db)):
    try:
        token_url = "https://kauth.kakao.com/oauth/token"
        data = {
            "grant_type": "authorization_code",
            "client_id": "dda96a1a63ca7218188c2bfb063b1a0a",
            "redirect_uri": "http://localhost:8000/kakao-callback",
            "code": code,
        }
        headers = {
            "Content-type": "application/x-www-form-urlencoded;charset=utf-8"
        }
        
        token_response = requests.post(token_url, data=data, headers=headers)
        access_token = token_response.json().get("access_token")
        
        user_info_url = "https://kapi.kakao.com/v2/user/me"
        user_info_response = requests.get(user_info_url, headers={"Authorization": f"Bearer {access_token}"})
        user_info = user_info_response.json()
        
        logger.info(f"Received user info from Kakao: {user_info}")

        kakao_account = user_info.get("kakao_account", {})
        profile = kakao_account.get("profile", {})

        email = kakao_account.get("email")
        nickname = profile.get("nickname")
        name = kakao_account.get("name")
        phone_number = kakao_account.get("phone_number")

        logger.info(f"Extracted email: {email}, nickname: {nickname}, name: {name}, phone_number: {phone_number}")

        if not all([email, nickname, name, phone_number]):
            missing_fields = [field for field, value in [("email", email), ("nickname", nickname), ("name", name), ("phone_number", phone_number)] if not value]
            logger.error(f"Missing required information from Kakao: {', '.join(missing_fields)}")
            raise HTTPException(status_code=400, detail=f"필수 정보({', '.join(missing_fields)})를 가져오지 못했습니다. 카카오 계정 설정을 확인해주세요.")

        # 사용자 정보를 데이터베이스에 저장 또는 업데이트
        db_user = crud.get_or_create_kakao_user(db, email=email, nickname=nickname, name=name, phone_number=phone_number)

        # 프론트엔드로 리다이렉트
        frontend_url = "http://192.168.219.55:3000/"
        query_params = urlencode({
            "email": email,
            "nickname": nickname,
            "name": name,
            "phone_number": phone_number,
            "user_id": db_user.u_id
        })
        return RedirectResponse(url=f"{frontend_url}?{query_params}")

    except Exception as e:
        logger.exception("Error in kakao_callback")
        raise HTTPException(status_code=500, detail=str(e))