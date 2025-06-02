# 환경변수 사용법

## 루트 .env 파일
`docker-compose.yml`에서 사용하는 모든 환경변수가 루트 디렉토리의 `.env` 파일에 정의되어 있습니다.

## 주요 환경변수
- `API_PORT`: 백엔드 API 서버 포트 (기본: 8000)
- `FRONTEND_PORT`: 프론트엔드 개발 서버 포트 (기본: 3000)
- `REACT_APP_API_URL`: 프론트엔드에서 백엔드 API 접근 URL
- `BACKEND_URL`: 백엔드 URL (CORS 설정용)
- `FRONTEND_URL`: 프론트엔드 URL (CORS 설정용)

## Docker Compose 실행
```bash
# 환경변수가 자동으로 로드됨
docker compose up -d

# 설정 확인
docker compose config
```

## 환경별 설정 변경
`.env` 파일을 수정하여 개발/스테이징/프로덕션 환경에 맞게 URL을 변경하세요. 