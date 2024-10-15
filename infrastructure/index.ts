import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as docker from "@pulumi/docker";

const config = new pulumi.Config();
const containerPort = config.getNumber("containerPort") || 80;
const cpu = config.getNumber("cpu") || 512;
const memory = config.getNumber("memory") || 128;

// Create an IAM Role for ECS Task Execution
const ecsTaskExecutionRole = new aws.iam.Role("HPecsTaskExecutionRole", {
  assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
    Service: "ecs-tasks.amazonaws.com",
  }),
});

// Attach the AmazonECSTaskExecutionRolePolicy to the IAM Role
const ecsTaskExecutionRolePolicyAttachment = new aws.iam.RolePolicyAttachment(
  "ecsTaskExecutionRolePolicyAttachment",
  {
    role: ecsTaskExecutionRole.name,
    policyArn:
      "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy",
  },
);

// Create a VPC
const vpc = new awsx.ec2.Vpc("HPVPC", {
  assignGeneratedIpv6CidrBlock: true,
  cidrBlock: "10.0.0.0/24",
  subnetSpecs: [
    {
      type: awsx.ec2.SubnetType.Public,
      name: "HP-Public-Subnet",
      cidrMask: 28,
    },
  ],
  numberOfAvailabilityZones: 2,
  subnetStrategy: awsx.ec2.SubnetAllocationStrategy.Auto,
  natGateways: {
    strategy: awsx.ec2.NatGatewayStrategy.None,
  },
});

// Create an ECR repository
const repo = new awsx.ecr.Repository("HP-repo");

const image = new docker.Image("HPImage", {
  build: {
    context: "../",
    dockerfile: "../Dockerfile",
    platform: "linux/amd64",
  },
  imageName: pulumi.interpolate`${repo.url}:latest`,
  registry: {
    server: repo.url,
    username: aws.ecr.getAuthorizationToken().then((token) => token.userName),
    password: aws.ecr.getAuthorizationToken().then((token) => token.password),
  },
});

// An ECS cluster to deploy into
const cluster = new aws.ecs.Cluster("HPCluster", {});

// Create a Fargate task definition for the Node.js app
const taskDefinition = new aws.ecs.TaskDefinition("HPTask", {
  family: "HP-task-family",
  cpu: "256",
  memory: "512",
  networkMode: "awsvpc",
  requiresCompatibilities: ["FARGATE"],
  executionRoleArn: ecsTaskExecutionRole.arn,
  containerDefinitions: pulumi.output(image).apply((image) =>
    JSON.stringify([
      {
        name: "hp-stuff",
        image: "node:20-slim", // Use your Node.js app image
        essential: true,
        portMappings: [
          {
            containerPort: 80,
            hostPort: 80,
            protocol: "tcp",
          },
        ],
      },
    ]),
  ),
});

// Create a security group for the ECS service
const ecsSecurityGroup = new aws.ec2.SecurityGroup("HP-sg", {
  vpcId: vpc.vpcId,
  ingress: [
    { protocol: "tcp", fromPort: 80, toPort: 80, cidrBlocks: ["0.0.0.0/0"] },
  ],
  egress: [
    { protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] },
  ],
});

// Create an ECS Service
const service = new aws.ecs.Service("HP-service", {
  cluster: cluster.arn,
  taskDefinition: taskDefinition.arn,
  desiredCount: 1,
  launchType: "FARGATE",
  networkConfiguration: {
    subnets: vpc.publicSubnetIds,
    securityGroups: [ecsSecurityGroup.id],
  },
});

// Create an API Gateway
const api = new aws.apigatewayv2.Api("HP-api", {
  protocolType: "HTTP",
});

// Create a VPC Link for the API Gateway
const vpcLink = new aws.apigatewayv2.VpcLink("HP-vpc-link", {
  name: "HPVpcLink",
  subnetIds: vpc.publicSubnetIds,
  securityGroupIds: [ecsSecurityGroup.id],
});

// Create an API Gateway Integration
const integration = new aws.apigatewayv2.Integration("HP-integration", {
  apiId: api.id,
  integrationType: "HTTP_PROXY",
  integrationUri: pulumi.interpolate`http://${service.loadBalancers.apply((loadBalancers) => `loadBalancers[0].dnsName`)}`,
  connectionType: "VPC_LINK",
  connectionId: vpcLink.id,
});

// Create an API Gateway Route
const route = new aws.apigatewayv2.Route("HP-route", {
  apiId: api.id,
  routeKey: "GET /",
  target: pulumi.interpolate`integrations/${integration.id}`,
});

// Deploy the API
const stage = new aws.apigatewayv2.Stage("HP-stage", {
  apiId: api.id,
  name: "$default",
  autoDeploy: true,
});

// Export the API endpoint
export const url = stage.invokeUrl;
