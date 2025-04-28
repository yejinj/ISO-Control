#!/bin/bash

set -e

# 1. .env 파일 불러오기
export $(grep -v '^#' .env | xargs)

# 2. 프로브 YAML 목록
PROBES_DIR="k8s/probes"
FILES=(
  "deployment.yaml"
  "liveness-probe.yaml"
  "readiness-probe.yaml"
  "startup-probe.yaml"
)

# 3. 출력 경로 (치환된 YAML)
OUTPUT_DIR="k8s/probes/build"
mkdir -p $OUTPUT_DIR

# 4. 각 YAML 변수 치환하여 저장
for FILE in "${FILES[@]}"; do
  envsubst < "$PROBES_DIR/$FILE" > "$OUTPUT_DIR/$FILE"
  echo "$FILE → $OUTPUT_DIR/$FILE"
done

# 5. deployment.yaml만 apply
kubectl apply -f "$OUTPUT_DIR/deployment.yaml" --namespace=isocontrol
