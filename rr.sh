#!/bin/bash
set -e

NAMESPACE="isocontrol"
PROBES_DIR="k8s/probes"
OUTPUT_DIR="$PROBES_DIR/build"
FILES=( "deployment.yaml" "liveness-probe.yaml" "readiness-probe.yaml" )

if [ ! -f .env ]; then
  echo ".env 파일이 없습니다. 환경변수를 직접 export 하거나 .env 파일을 생성하세요."
  exit 1
fi
 
export $(grep -v '^#' .env | xargs)
 
mkdir -p $OUTPUT_DIR

for FILE in "${FILES[@]}"; do
  envsubst < "$PROBES_DIR/$FILE" > "$OUTPUT_DIR/$FILE"
  echo "$FILE → $OUTPUT_DIR/$FILE"
done

echo "모든 yaml을 $NAMESPACE 네임스페이스에 배포합니다."
kubectl apply -f "$OUTPUT_DIR" --namespace="$NAMESPACE"