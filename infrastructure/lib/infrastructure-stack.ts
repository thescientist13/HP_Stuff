import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import *as pipelines from 'aws-cdk-lib/pipelines';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


  }
}
// vim: shiftwidth=2:tabstop=2:expandtab 

