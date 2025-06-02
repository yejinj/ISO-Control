FROM python:3.9-slim

WORKDIR /app

# 시스템 패키지 설치
RUN apt-get update && apt-get install -y \
    sshpass \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Python 의존성 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 애플리케이션 코드 복사
COPY . .

# 환경변수 설정
ENV API_HOST=0.0.0.0
ENV API_PORT=8000

# 포트 노출 (빌드 시점에는 기본값 사용)
EXPOSE 8000

# 애플리케이션 실행
CMD ["sh", "-c", "uvicorn app.main:app --host $API_HOST --port $API_PORT --reload"] 