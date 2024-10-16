import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as dockerBuild from "@pulumi/docker-build";

const config = new pulumi.Config();

const repo = new awsx.ecr.Repository("hp-stuff-repo", {
  forceDelete: true,
  name: "hp-stuff-repo",
  lifecyclePolicy: {
    rules: [
      {
        maximumNumberOfImages: 10,
        tagStatus: "any",
      },
    ],
  },
});

const cluster = new aws.ecs.Cluster("hp-stuff-cluster", {});

const lb = new awsx.lb.NetworkLoadBalancer("HPLB", {});

const auth = aws.ecr.getAuthorizationTokenOutput({
  registryId: repo.repository.registryId,
});

const HPImage = new dockerBuild.Image("HPImage", {
  cacheFrom: [
    {
      registry: {
        ref: pulumi.interpolate`${repo.url}:cache`,
      },
    },
  ],
  cacheTo: [
    {
      registry: {
        imageManifest: true,
        ociMediaTypes: true,
        ref: pulumi.interpolate`${repo.url}:cache`,
      },
    },
  ],
  platforms: [dockerBuild.Platform.Linux_arm64],
  push: true,
  registries: [
    {
      address: repo.url,
      password: auth.password,
      username: auth.userName,
    },
  ],
  tags: [pulumi.interpolate`${repo.url}:latest`],
  context: {
    location: "../",
  },
});
