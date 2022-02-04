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
          'git submodule init',
          'git submodule update',
          'npm ci',
          'npm run build',
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

    const HPBucket = new s3.Bucket(this, 'HPHugoBucket', {
      encryption: s3.BucketEncryption.KMS,
      bucketKeyEnabled: true,
      enforceSSL: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      publicReadAccess: false,
      removalPolicy: RemovalPolicy.DESTROY, //safe since everything in here is generated
      autoDeleteObjects: true, // safe since everything in here is generated
    });

    const HugoCert = new acm.DnsValidatedCertificate(this, 'HugoCert', {
      domainName: HugoSite,
      hostedZone: SOZone,
    });

    const HugoCFD = new cloudfront.Distribution(this, 'HugoDist', {
      defaultBehavior: { 
        origin: new origins.S3Origin(HPBucket),
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      certificate: HugoCert,
      domainNames: [ HugoSite ],
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
      accessControl: s3.BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
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

