#!/usr/bin/env sh
sh bin/build.sh

if [ -z $DEPLOYMENT_TARGET ]; then
    echo "Deriving DEPLOYMENT_TARGET from terraform output..."
    DEPLOYMENT_TARGET=$(terraform output site_bucket_id)
    DEPLOYMENT_TARGET=${DEPLOYMENT_TARGET%\"}
    DEPLOYMENT_TARGET=${DEPLOYMENT_TARGET#\"}
fi
echo "DEPLOYMENT_TARGET: " $DEPLOYMENT_TARGET

aws s3 sync dist/ s3://$DEPLOYMENT_TARGET \
    --acl public-read \
    --size-only \
    --exclude '.DS_Store' \
    --delete
