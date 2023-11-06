#!/usr/bin/env node
import 'source-map-support/register.js';
import * as core from 'aws-cdk-lib';

import { VideoProcessingStack } from './stacks/videoProcessing/videoProcessingStack.js';

const awsRegion = process.env['AWS_REGION'] || process.env['AWS_DEFAULT_REGION'];

const awsAccount = process.env['AWS_ACCOUNT_ID'];

const alertEmail = process.env['ALERT_EMAIL'];

console.log({
  awsRegion,
  awsAccount,
  alertEmail,
});

if (!awsRegion || !awsAccount || !alertEmail) {
  throw new Error('Missing environment variables');
}

const app = new core.App();

new VideoProcessingStack(app, 'VideoProcessingStack', {
  env: {
    account: awsAccount,
    region: awsRegion,
  },
  alertEmail,
});
