#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { PrivateWebserverStack } from '../lib/webserver-stack';

const app = new cdk.App();

new PrivateWebserverStack(app, 'PrivateWebserverStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
