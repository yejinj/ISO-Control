# 환경변수 설정 가이드

이 프로젝트는 환경변수를 통해 API 서버 주소와 포트를 관리합니다.

## 환경변수 파일 구조

```
.
├── .env                    # Docker Compose용 환경변수
├── backend/
│   └── .env               # 백엔드 애플리케이션 환경변수
└── frontend/
    └── .env               # 프론트엔드 애플리케이션 환경변수
```

## 초기 설정

1. **환경변수 파일 복사** (이미 생성되어 있음)
   ```bash
   # 예제 파일이 있는 경우 복사
   cp .env.example .env
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

2. **필요한 값 수정**
   - `backend/.env`의 `SSH_PASSWORD`를 실제 값으로 변경
   - 필요시 API 호스트/포트 변경

## 주요 환경변수 설명

### 루트 .env (Docker Compose용)
- `API_PORT`: 백엔드 API 서버 포트 (기본값: 8000)
- `FRONTEND_PORT`: 프론트엔드 개발 서버 포트 (기본값: 3000)
- `REACT_APP_API_URL`: 프론트엔드에서 백엔드 API 접근 URL

### backend/.env
- `API_HOST`: API 서버 바인딩 호스트 (기본값: 0.0.0.0)
- `API_PORT`: API 서버 포트 (기본값: 8000)
- `FRONTEND_URL`: CORS 허용할 프론트엔드 URL
- `BACKEND_URL`: CORS 허용할 백엔드 자체 URL
- `SSH_PASSWORD`: 노드 SSH 접근 패스워드

### frontend/.env
- `REACT_APP_API_URL`: 백엔드 API 서버 URL
- `PORT`: React 개발 서버 포트

## 환경별 설정

### 개발 환경 (기본값)
```
REACT_APP_API_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000
```

### 프로덕션 환경 예시
```
REACT_APP_API_URL=https://api.example.com
FRONTEND_URL=https://app.example.com
BACKEND_URL=https://api.example.com
```

## Docker Compose 실행
```bash
# 환경변수가 자동으로 로드됨
docker-compose up -d
```

## 주의사항
- `.env` 파일들은 Git에 커밋하지 않습니다 (.gitignore에 추가됨)
- `.env.example` 파일들은 Git에 커밋하여 다른 개발자가 참고할 수 있도록 합니다
- 민감한 정보(패스워드 등)는 `.env.example`에 포함하지 않습니다 