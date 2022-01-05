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
			synth: new pipelines.CodeBuildStep('Synth', {
				input: pipelines.CodePipelineSource.codeCommit(repo , 'master'),
        primaryOutputDirectory: 'infrastructure/cdk.out',
        installCommands: [
          'cd infrastructure', 
          'apt-get update',
          'curl -L -o hugo.deb https://github.com/gohugoio/hugo/releases/download/v0.91.2/hugo_0.91.2_Linux-64bit.deb',
          'dpkg -i hugo.deb',
        ],
				commands: [
          'npm ci', 
          'npm run build', 
          'npx cdk synth',
        ],
			}),
		});

  }
}
// vim: shiftwidth=2:tabstop=2:expandtab 

