Kubernetes 환경에서 서비스/Pod의 상태를 감시하고,  
비정상 감지 시 자동 조치 및 장애 이력을 기록/시각화하는 시스템

---

## 주요 기능

- **Pod/서비스 헬스체크 자동화** (Probe, Sidecar)
- **비정상 상태 감지 시 자동 재시작/격리**
- **장애 이력 기록 및 관리자 페이지에서 시각화**
- **관리자 UI(React) + API 서버(FastAPI) + K8s manifest**


---

## 실행 방법

### 1. 프론트엔드 (admin-ui)
```bash
cd admin-ui
npm install
npm run dev
```

### 2. 백엔드 (admin-api)
```bash
cd admin-api
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 3. 쿠버네티스 매니페스트 적용
```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/simple-nginx.yaml
# 기타 필요한 매니페스트도 적용
```

### 4. 사이드카 이미지 빌드
```bash
cd k8s/sidecar/monitor
docker build -t localhost:5000/sidecar-monitor:latest .
cd ../latency
docker build -t localhost:5000/sidecar-latency:latest .
```