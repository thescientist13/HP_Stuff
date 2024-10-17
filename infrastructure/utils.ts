import * as fs from "fs";

// crawlDirectory recursive crawls the provided directory, applying the provided function
// to every file it contains. Doesn't handle cycles from symlinks.
export function crawlDirectory(dir: string, f: (_: string) => void) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = `${dir}/${file}`;
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      crawlDirectory(filePath, f);
    }
    if (stat.isFile()) {
      f(filePath);
    }
  }
}

// Copyright 2016-2024, Pulumi Corporation.  All rights reserved.

import * as aws from "@pulumi/aws";

export function configureACL(
  bucketName: string,
  bucket: aws.s3.BucketV2,
  acl: string,
): aws.s3.BucketAclV2 {
  const ownership = new aws.s3.BucketOwnershipControls(bucketName, {
    bucket: bucket.bucket,
    rule: {
      objectOwnership: "BucketOwnerPreferred",
    },
  });
  const publicAccessBlock = new aws.s3.BucketPublicAccessBlock(bucketName, {
    bucket: bucket.bucket,
    blockPublicAcls: false,
    blockPublicPolicy: false,
    ignorePublicAcls: false,
    restrictPublicBuckets: false,
  });
  const bucketACL = new aws.s3.BucketAclV2(
    bucketName,
    {
      bucket: bucket.bucket,
      acl: acl,
    },
    {
      dependsOn: [ownership, publicAccessBlock],
    },
  );
  return bucketACL;
}
