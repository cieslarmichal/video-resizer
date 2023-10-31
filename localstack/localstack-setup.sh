#!/bin/bash

echo "CREATING S3 BUCKETS"

awslocal s3 mb s3://videos --region eu-central-1
awslocal s3 mb s3://resized-videos --region eu-central-1

echo "S3 BUCKETS CREATED"

awslocal s3 ls --region eu-central-1



