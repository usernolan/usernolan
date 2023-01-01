#!/usr/bin/env sh

terraform plan -var-file user.tfvars -out tf.plan
