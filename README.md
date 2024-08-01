# KOCIAL: 한류 해외시장 진출 가능성 평가 서비스

## 목차
1. [프로젝트 소개](#1-프로젝트-소개)
2. [팀 소개](#2-팀-소개)
3. [프로젝트 특장점](#3-프로젝트-특장점)
4. [프로젝트 개발 내용](#4-프로젝트-개발-내용)
5. [사용 기술](#5-사용-기술)
6. [프로젝트 결과물](#6-프로젝트-결과물)
7. [기대효과 및 활용분야](#7-기대효과-및-활용분야)

## 1. 프로젝트 소개

KOCIAL은 LDA와 코사인 유사도를 이용하여 한류 해외시장 진출 가능성을 평가하는 서비스입니다. 트렌드 분석을 통해 한류 시장에서 기회를 포착하고자 하는 기업들을 위해 개발되었습니다.

주요 기능:
- 트렌드 분석을 통해 한류 시장에서 기회를 포착하고 싶은 기업을 위한 서비스 
- 한류 시장으로 진출하려는 기업들에게 가능성을 평가해주는 서비스
- 진출하고자 하는 키워드를 입력하면 국가별로 평가해주고, 최적 진출국 및 전략을 제안


## 2. 팀 소개

팀명: KOCIAL

| 이름 | 역할 | 전공 |
|------|------|------|
| 이재영 | 팀장 | 전자공학과 |
| 김진리 | 팀원 | 전자공학과 |
| 김은아 | 팀원 | 전기공학과 |
| 박유빈 | 팀원 | 화학공학과 |


## 3. 프로젝트 특장점

- 국가별 트렌드 파악으로 시장 분석 가능
- 최신 트렌드와 과거 이슈를 종합적으로 분석하여 기업이 직면한 기회와 도전 과제 파악 가능
- 사용자가 궁금한 키워드에 관한 성공 가능성 평가
- 현지화 정도에 따라 진출 전략 제안

## 4. 프로젝트 개발 내용

### 데이터 수집 및 전처리
- 국가별 현지 뉴스 크롤링
- kiwipiepy 형태소 분석을 통해 명사 추출
- LDA 모델링을 통해 토픽 데이터 추출
- 토픽 단어로 이슈 추출

### 트렌드 분석
- K-means 클러스터링 알고리즘을 사용하여 데이터 군집화
- 군집화한 데이터를 바탕으로 LDA 모델 학습
- 토픽 분포를 계산한 후 토픽간 코사인 유사도를 통해 유사 토픽 병합
- 토픽을 title와 비교하고 text-rank 결과로 주요 이슈 추출
- 분석 후 유사도가 높은 이슈를 최종 추출
- 추출된 이슈 데이터를 생성형 AI를 통해 요약

### 이슈 히스토리
- 사전에 추출한 이슈 데이터와 토픽 데이터를 활용
- 토픽 데이터를 토픽번호로 그룹화
- 이슈 데이터와 토픽 데이터 병합
- word 컬럼 비교, 공통된 단어 3개 이상인 경우 추출
- amcharts 라이브러리 사용하여 그래프 시각화

### 성공 가능성 예측
- 키워드를 request로 전송하고 응답하도록 API 생성
- 키워드와 가장 연관이 있는 뉴스데이터 제공
- 빈도수와 RAG를 통해 사용자에게 직관적으로 정보 제공

### 웹 구현
- 한류 대표 색상을 활용한 깔끔한 페이지 구성
- 단계적 페이지 구성
- React 기본 툴을 이용한 웹 디자인
- FastAPI를 이용하여 데이터 요청 및 응답

## 5. 사용 기술

- **DB 및 서버**: MySQL, FastAPI
- **프론트엔드**: React, JavaScript, HTML, CSS, Tailwind CSS, amcharts
- **데이터 전처리**: okt, kiwipiepy, pandas, mecab, konlpy
- **데이터 분석**: TF-IDF, K-means, 코사인 유사도, LDA모델, text-rank 알고리즘, RAG(vector DB), OpenAI API

## 6. 프로젝트 결과물

![결과물사진_STEP1](https://github.com/user-attachments/assets/253f7a53-6136-4a23-9628-ada453ba1ee7)
![image](https://github.com/user-attachments/assets/0b7a6967-ed01-4116-8f5d-e2892179a463)
![image](https://github.com/user-attachments/assets/9996c5ac-26a5-4f3e-a4a7-895a453d28ba)
![image](https://github.com/user-attachments/assets/665b6d57-42b7-4d77-b47d-b51423a08ceb)


## 7. 기대효과 및 활용분야

### 기대효과
1. 해외 시장에서의 성공 가능성을 높이고, 한국 기업의 글로벌 진출 촉진
2. 외국과의 문화 교류 활성화 및 우호 관계 증진

### 활용분야
1. 시장 진출 후 전략적인 마케팅을 위한 컨설팅 기획
2. 국가별 선호도 파악으로 지속적인 한류 확산을 위한 정책 수립
