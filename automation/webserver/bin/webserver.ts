#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { WebserverStack } from '../lib/webserver-stack';

const app = new cdk.App();

new WebserverStack(app, 'PrivateWebserverStack', {
  env: {
    account: '758890598841',
    region: 'ap-south-1',
  },
});
