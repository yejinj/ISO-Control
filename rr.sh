#!/bin/bash

set -e

export $(grep -v '^#' .env | xargs)

PROBES_DIR="k8s/probes"
FILES=(
  "deployment.yaml"
  "liveness-probe.yaml"
  "readiness-probe.yaml"
  "startup-probe.yaml"
)

OUTPUT_DIR="k8s/probes/build"
mkdir -p $OUTPUT_DIR

for FILE in "${FILES[@]}"; do
  envsubst < "$PROBES_DIR/$FILE" > "$OUTPUT_DIR/$FILE"
  echo "$FILE → $OUTPUT_DIR/$FILE"
done

kubectl apply -f "$OUTPUT_DIR/deployment.yaml" --namespace=isocontrol
