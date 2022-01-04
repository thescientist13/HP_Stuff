import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import { aws_s3 as s3 } from 'aws-cdk-lib';

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

		const bucket = new s3.Bucket(this, 'HPBucket', {
			autoDeleteObjects: true,
			removalPolicy: cdk.RemovalPolicy.DESTROY,
			websiteIndexDocument: 'index.html',
			websiteErrorDocument: '404.html',
			enforceSSL: true,
			publicReadAccess: true,
		});

  }
}
