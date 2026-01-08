#!/bin/bash
set -e

SERVER_IP=$1
API_KEY=$2
BASE_URL="http://$SERVER_IP"

if [ -z "$SERVER_IP" ] || [ -z "$API_KEY" ]; then
  echo "Usage: $0 <server-ip> <api-key>"
  exit 1
fi

echo "Running E2E tests against $BASE_URL"

api() {
  curl -s -H "X-Frost-Token: $API_KEY" -H "Content-Type: application/json" "$@"
}

echo ""
echo "=== Test 1: Create project ==="
PROJECT=$(api -X POST "$BASE_URL/api/projects" -d '{"name":"e2e-test"}')
PROJECT_ID=$(echo "$PROJECT" | jq -r '.id')

if [ "$PROJECT_ID" = "null" ] || [ -z "$PROJECT_ID" ]; then
  echo "Failed to create project:"
  echo "$PROJECT" | jq
  exit 1
fi

echo "Created project: $PROJECT_ID"

echo ""
echo "=== Test 2: Create service ==="
SERVICE=$(api -X POST "$BASE_URL/api/projects/$PROJECT_ID/services" \
  -d '{"name":"test-nginx","deployType":"image","imageUrl":"nginx:alpine","containerPort":80}')
SERVICE_ID=$(echo "$SERVICE" | jq -r '.id')

if [ "$SERVICE_ID" = "null" ] || [ -z "$SERVICE_ID" ]; then
  echo "Failed to create service:"
  echo "$SERVICE" | jq
  exit 1
fi

echo "Created service: $SERVICE_ID"

echo ""
echo "=== Test 3: Deploy service ==="
DEPLOY=$(api -X POST "$BASE_URL/api/services/$SERVICE_ID/deploy")
DEPLOYMENT_ID=$(echo "$DEPLOY" | jq -r '.deployment_id')

if [ "$DEPLOYMENT_ID" = "null" ] || [ -z "$DEPLOYMENT_ID" ]; then
  echo "Failed to deploy:"
  echo "$DEPLOY" | jq
  exit 1
fi

echo "Started deployment: $DEPLOYMENT_ID"

echo ""
echo "=== Test 4: Wait for deployment ==="
for i in {1..24}; do
  DEPLOYMENT=$(api "$BASE_URL/api/deployments/$DEPLOYMENT_ID")
  STATUS=$(echo "$DEPLOYMENT" | jq -r '.status')
  echo "Deployment status: $STATUS"

  if [ "$STATUS" = "running" ]; then
    echo "Deployment successful!"
    break
  elif [ "$STATUS" = "failed" ]; then
    echo "Deployment failed!"
    echo "$DEPLOYMENT" | jq
    exit 1
  fi

  if [ "$i" -eq 24 ]; then
    echo "Deployment timed out"
    exit 1
  fi

  sleep 5
done

echo ""
echo "=== Test 5: Verify service responds ==="
HOST_PORT=$(api "$BASE_URL/api/deployments/$DEPLOYMENT_ID" | jq -r '.hostPort')
echo "Service running on port: $HOST_PORT"

if curl -sf "http://$SERVER_IP:$HOST_PORT" > /dev/null; then
  echo "Service is responding!"
else
  echo "Service failed to respond"
  exit 1
fi

echo ""
echo "=== Test 6: Cleanup - delete project ==="
DELETE_RESULT=$(api -X DELETE "$BASE_URL/api/projects/$PROJECT_ID")
echo "Deleted project"

echo ""
echo "========================================="
echo "All E2E tests passed!"
echo "========================================="
