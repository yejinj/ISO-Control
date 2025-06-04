# 환경변수 사용법
`docker-compose.yml`에서 사용되는 모든 환경변수를 루트의 `.env` 에서 정의합니다.

## 주요 환경변수
- `API_PORT`: 백엔드 API 서버 포트
- `FRONTEND_PORT`: 프론트엔드 개발 서버 포트
- `REACT_APP_API_URL`: 프론트엔드에서 백엔드 API 접근 URL
- `BACKEND_URL`: CORS 설정용 백엔드 URL
- `FRONTEND_URL`: CORS 설정용 프론트엔드 URL

## Docker Compose 실행
```bash
docker compose up -d # 환경변수 로딩
docker compose config # 설정 확인
```

## 환경별 설정 변경
`.env` 파일을 수정하여 개발/스테이징/프로덕션 환경에 맞게 URL을 변경하세요. 