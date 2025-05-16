from fastapi import APIRouter
import psutil
from kubernetes import client, config
from typing import Dict, List
import subprocess
import json

router = APIRouter()

def get_pvc_usage() -> Dict[str, Dict[str, float]]:
    try:
        # Kubernetes API 설정
        try:
            config.load_incluster_config()
        except:
            config.load_kube_config()
        
        v1 = client.CoreV1Api()
        
        # 모든 PVC 조회
        pvcs = v1.list_persistent_volume_claim_for_all_namespaces()
        pvc_usage = {}
        
        for pvc in pvcs.items:
            namespace = pvc.metadata.namespace
            pvc_name = pvc.metadata.name
            pvc_key = f"{namespace}/{pvc_name}"
            
            # PVC가 바인딩된 PV 이름 가져오기
            pv_name = pvc.spec.volume_name if pvc.spec.volume_name else None
            if not pv_name:
                continue
                
            # PV 상세 정보 조회
            try:
                pv = v1.read_persistent_volume(pv_name)
                if not pv.spec.host_path:
                    continue
                    
                # hostPath의 실제 사용량 확인
                host_path = pv.spec.host_path.path
                try:
                    # df 명령어로 디스크 사용량 확인
                    result = subprocess.run(
                        ['df', '-B1', host_path],  # 1바이트 단위로 출력
                        capture_output=True,
                        text=True
                    )
                    
                    if result.returncode == 0:
                        # df 출력 파싱
                        lines = result.stdout.strip().split('\n')
                        if len(lines) >= 2:
                            # 헤더 제외하고 실제 데이터 라인 파싱
                            data = lines[1].split()
                            if len(data) >= 5:
                                total = int(data[1])  # 전체 크기
                                used = int(data[2])  # 사용량
                                
                                # 사용률 계산 (소수점 1자리)
                                usage_percent = round((used / total) * 100, 1)
                                pvc_usage[pvc_key] = usage_percent
                                
                except Exception as e:
                    print(f"Error getting disk usage for {host_path}: {e}")
                    continue
                    
            except Exception as e:
                print(f"Error getting PV info for {pv_name}: {e}")
                continue
        
        return pvc_usage
    except Exception as e:
        print(f"PVC usage check error: {e}")
        return {}

@router.get("/probes")
async def get_probes():
    cpu = psutil.cpu_percent(interval=1)
    mem = psutil.virtual_memory().percent
    # 소수점 한 자리로 제한, None이면 0 반환
    cpu = round(cpu, 1) if cpu is not None else 0
    mem = round(mem, 1) if mem is not None else 0
    
    # PVC 사용량 조회
    pvc_usage = get_pvc_usage()
    
    return {
        "liveness": {"fail_count": 2},
        "readiness": {"fail_count": 5},
        "cpuUsage": cpu,
        "memoryUsage": mem,
        "pvcUsage": pvc_usage
    }

@router.get("/healthz")
async def healthz():
    return {"status": "healthy"}

@router.get("/ready")
async def ready():
    return {"status": "ready"}

def get_pod_status(pod):
    liveness = None
    readiness = None
    if pod.status.container_statuses:
        for cs in pod.status.container_statuses:
            if cs.state and cs.state.running:
                liveness = True
            elif cs.state and (cs.state.waiting or cs.state.terminated):
                liveness = False
    if pod.status.conditions:
        for cond in pod.status.conditions:
            if cond.type == "Ready":
                readiness = (cond.status == "True")
    return {
        "liveness": liveness,
        "readiness": readiness
    } 