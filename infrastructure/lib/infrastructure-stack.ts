import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import *as pipelines from 'aws-cdk-lib/pipelines';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

		const repo = new codecommit.Repository(this, 'HPRepo', {
			repositoryName: 'HP_Stuff',
			description: 'Luke Schierer\'s Harry Potter Stuff',
		});

		const pipeline = new pipelines.CodePipeline(this, 'Pipeline', {
			pipelineName: 'HP_Pipeline',
			crossAccountKeys: false,
			synth: new pipelines.ShellStep('Synth', {
				input: pipelines.CodePipelineSource.codeCommit(repo , 'master'),
        primaryOutputDirectory: 'infrastructure',
				commands: [
          'cd infrastructure', 
          'npm ci', 
          'npm run build', 
          'npx cdk synth',
        ],
			}),
		});

  }
}
// vim: shiftwidth=2:tabstop=2:expandtab 

