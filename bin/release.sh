#!/usr/bin/env sh
sh bin/build.sh

if [ -z $DEPLOYMENT_TARGET ]; then
    echo "Deriving DEPLOYMENT_TARGET from terraform output..."
    DEPLOYMENT_TARGET=$(terraform output site_bucket_id)
    DEPLOYMENT_TARGET=${DEPLOYMENT_TARGET%\"}
    DEPLOYMENT_TARGET=${DEPLOYMENT_TARGET#\"}
fi
echo "DEPLOYMENT_TARGET: " $DEPLOYMENT_TARGET

# --size-only \
aws s3 sync dist/ s3://$DEPLOYMENT_TARGET \
    --acl public-read \
    --delete \
    --exclude '*.avif' \
    --exclude '*.jpeg' \
    --exclude '*.mp4' \
    --exclude '*.png' \
    --exclude '*.webm' \
    --exclude '*.webp' \
    --exclude '*.DS_Store'
