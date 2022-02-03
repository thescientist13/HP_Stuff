import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import { aws_cloudformation as cfn } from 'aws-cdk-lib';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as targets from 'aws-cdk-lib/aws-route53-targets';


export class InfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const HugoSute = 'hpfan.schierer.org';

    const SOZone = route53.HostedZone.fromHostedZoneAttributes(this, 'SOZone', {
      zoneName: 'schierer.org',
      hostedZoneId: 'ZOB4NXMJR2BZF',
    });

    const HPBucket = new s3.Bucket(this, 'HPHugoBucket', {
      encryption: s3.BucketEncryption.KMS,
      bucketKeyEnabled: true,
      enforceSSL: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      publicReadAccess: false,
      removalPolicy: RemovalPolicy.DESTROY, //safe since everything in here is generated
      autoDeleteObjects: true, // safe since everything in here is generated
    });

    /*const HPRecord = new route53.ARecord(this, 'Alias', {
      zone: SOZone,
      recordName: HugoSute, 
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
    });
    */

  }
}
// vim: shiftwidth=2:tabstop=2:expandtab 

