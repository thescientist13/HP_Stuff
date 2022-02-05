import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Stage, StageProps } from 'aws-cdk-lib';
import { CodePipeline, CodePipelineSource, ManualApprovalStep, ShellStep } from 'aws-cdk-lib/pipelines';

import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import { aws_cloudformation as cfn } from 'aws-cdk-lib';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import { aws_codecommit as codecommit } from 'aws-cdk-lib';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import { aws_logs as logs } from 'aws-cdk-lib';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as targets from 'aws-cdk-lib/aws-route53-targets';


export class InfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const HUGO_VERSION = '0.92.0';

    const code = new codecommit.Repository(this, 'HPRepo', {
      repositoryName: 'HP_Stuff',
      description: "Luke Schierer's Harry Potter Stuff",
    });

    const HugoPipe = new CodePipeline(this, 'HugoPipeline', {
      pipelineName: 'Hugo_Pipeline',
      crossAccountKeys: false,
      selfMutation: true,
      synth: new ShellStep('install', {
        primaryOutputDirectory: 'infrastructure/cdk.out',
        input: CodePipelineSource.codeCommit(code, "master", {
          codeBuildCloneOutput: true,
        }),
        installCommands: [
          `curl -Ls https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_Linux-64bit.deb -o /tmp/hugo.deb`,
          'dpkg -i /tmp/hugo.deb',
        ],
        commands: [
          'npm ci',
          'npm run build',
          'git submodule init',
          'git submodule update',
          'hugo -v',
          'cd infrastructure',
          'npx cdk synth',
        ],
      }),
    });

    const Haccount = (!(props)) ? process.env.CDK_DEFAULT_ACCOUNT : (!(props.env)) ? process.env.CDK_DEFAULT_ACCOUNT : (!(props.env.account)) ? process.env.CDK_DEFAULT_ACCOUNT : props.env.account;
    const Hregion = (!(props)) ? process.env.CDK_DEFAULT_REGION : (!(props.env)) ? process.env.CDK_DEFAULT_REGION : (!(props.env.region)) ? process.env.CDK_DEFAULT_REGION : props.env.region;


    const hugoStage = new HSiteStage(this, "Hugo", {
      env: {
        account: Haccount,
        region: Hregion,
      }
    });

    HugoPipe.addStage(hugoStage);

  }
}

class HugoStack extends Stack { 
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const HugoSite = 'hpfan.schierer.org';

    const SOZone = route53.HostedZone.fromHostedZoneAttributes(this, 'SOZone', {
      zoneName: 'schierer.org',
      hostedZoneId: 'ZOB4NXMJR2BZF',
    });

    const accessLogsBucket = new s3.Bucket(this, 'AccessLogsBucket', {
      removalPolicy: RemovalPolicy.DESTROY, // these logs are only enabled to debug cloudfront
      autoDeleteObjects: true, // these logs are only enabled to debug cloudfrount
    });

    const HPBucket = new s3.Bucket(this, 'HPHugoBucket', {
      enforceSSL: false,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_ENFORCED,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: '/404.html',
      serverAccessLogsBucket: accessLogsBucket,
      serverAccessLogsPrefix: 's3access',
      intelligentTieringConfigurations: [{
        name: 'HugoS3ITC',
        archiveAccessTierTime: cdk.Duration.days(180),
        deepArchiveAccessTierTime: cdk.Duration.days(360),
      }],
      removalPolicy: RemovalPolicy.DESTROY, //safe since everything in here is generated
      autoDeleteObjects: true, // safe since everything in here is generated
    });

    const HugoCert = new acm.Certificate(this, 'HugoCert', {
      domainName: HugoSite,
      validation: acm.CertificateValidation.fromDns(SOZone),
    });

    const HOAId = new cloudfront.OriginAccessIdentity(this, 'Hugo OAId');
    const HS3O = new origins.S3Origin(HPBucket, { 
      originAccessIdentity: HOAId,
    });

    HPBucket.grantRead(HOAId);

    const HugoCFD = new cloudfront.Distribution(this, 'HugoDist', {
      defaultBehavior: { 
        origin: HS3O,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
      ],
      certificate: HugoCert,
      domainNames: [ HugoSite ],
      logBucket: accessLogsBucket,
      logFilePrefix: 'cfaccess',
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
    });



    HugoCFD.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);

    const HPARecord = new route53.ARecord(this, 'HPAliasRecord', {
      zone: SOZone,
      recordName: HugoSite,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(HugoCFD)),
    });

    const HugoDeploy = new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [
        s3deploy.Source.asset('../public')
      ],
      destinationBucket: HPBucket,
      distribution: HugoCFD,
      distributionPaths: [
        '/*',
      ],
      storageClass: s3deploy.StorageClass.INTELLIGENT_TIERING,
      logRetention: logs.RetentionDays.ONE_DAY,
    });

  }
}


class HSiteStage extends Stage {
  constructor(scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props);

    const HugoSite = new HugoStack(this, 'HugoStack', props);
  }
}

// vim: shiftwidth=2:tabstop=2:expandtab 

