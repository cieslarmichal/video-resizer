/* eslint-disable @typescript-eslint/naming-convention */
import * as core from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecrAssets from 'aws-cdk-lib/aws-ecr-assets';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambdaSources from 'aws-cdk-lib/aws-lambda-event-sources';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as snsSubscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { join } from 'path';

import { NodejsLambdaFunction } from '../../common/nodejsLambdaFunction.js';

export class VideoProcessingStack extends core.Stack {
  public constructor(scope: core.App, id: string, props: core.StackProps) {
    super(scope, id, props);

    const s3VideosBucket = new s3.Bucket(this, 'VideosBucket', {
      bucketName: 'videos-433862147055',
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: core.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const s3ResizedVideosBucket = new s3.Bucket(this, 'ResizedVideosBucket', {
      bucketName: 'resized-videos-433862147055',
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: core.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const topic = new sns.Topic(this, 'CreatedVideos');

    s3VideosBucket.addEventNotification(s3.EventType.OBJECT_CREATED, new s3n.SnsDestination(topic));

    const resizeVideoTo360pQueue = new sqs.Queue(this, 'ResizeVideoTo360pQueue', {
      queueName: 'ResizeVideoTo360pQueue',
      visibilityTimeout: core.Duration.minutes(15),
    });

    topic.addSubscription(new snsSubscriptions.SqsSubscription(resizeVideoTo360pQueue));

    const resizeVideoTo480pQueue = new sqs.Queue(this, 'ResizeVideoTo480pQueue', {
      queueName: 'ResizeVideoTo480pQueue',
      visibilityTimeout: core.Duration.minutes(15),
    });

    topic.addSubscription(new snsSubscriptions.SqsSubscription(resizeVideoTo480pQueue));

    const resizeVideoTo720pQueue = new sqs.Queue(this, 'ResizeVideoTo720pQueue', {
      queueName: 'ResizeVideoTo720pQueue',
      visibilityTimeout: core.Duration.minutes(15),
    });

    topic.addSubscription(new snsSubscriptions.SqsSubscription(resizeVideoTo720pQueue));

    const vpc = new ec2.Vpc(this, 'VPC', {
      natGateways: 2,
      maxAzs: 2,
    });

    const cluster = new ecs.Cluster(this, 'ECSCluster', {
      vpc: vpc as ec2.IVpc,
      containerInsights: true,
    });

    const ecsTaskDefinition = new ecs.TaskDefinition(this, `ECSTaskDefinition`, {
      compatibility: ecs.Compatibility.FARGATE,
      cpu: '16384',
      memoryMiB: '32768',
    });

    ecsTaskDefinition.addToTaskRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['s3:*'],
        resources: ['*'],
      }),
    );

    const asset = new ecrAssets.DockerImageAsset(this, 'AppDockerImage', {
      directory: join(process.cwd(), '..', 'backend'),
    });

    const container = new ecs.ContainerDefinition(this, 'MyContainer', {
      image: ecs.ContainerImage.fromDockerImageAsset(asset),
      taskDefinition: ecsTaskDefinition,
      logging: ecs.LogDriver.awsLogs({ streamPrefix: `${props?.stackName}-container-logs` }),
    });

    const lambdaRole = new iam.Role(this, 'lambda-role', {
      assumedBy: new iam.AnyPrincipal() as iam.IPrincipal,
      inlinePolicies: {
        'inline-lambda-trigger-policy': new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              resources: [ecsTaskDefinition.taskDefinitionArn],
              actions: ['ecs:RunTask'],
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              resources: ['*'],
              actions: ['iam:PassRole'],
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              resources: [cluster.clusterArn],
              actions: ['ecs:DescribeTasks'],
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              resources: ['*'],
              actions: ['ec2:*'],
            }),
          ],
        }),
      },
    });

    const subnets = vpc.selectSubnets({
      subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
    }).subnets;

    const lambdaEnvironment = {
      ['ECS_TASK_ARN']: ecsTaskDefinition.taskDefinitionArn,
      ['ECS_CLUSTER_ARN']: cluster.clusterArn,
      ['SUBNET_IDS']: subnets.map((sub) => sub.subnetId).join(','),
      ['ECS_CONTAINER_NAME']: container.containerName,
      ['S3_RESIZED_VIDEOS_BUCKET']: s3ResizedVideosBucket.bucketName,
      ['FFMPEG_PATH']: '/usr/bin/ffmpeg',
    };

    const triggerVideoResizingTo360pLambda = new NodejsLambdaFunction(this, 'TriggerVideoResizingTo360pLambda', {
      entry: `${process.cwd()}/src/stacks/videoProcessing/lambdas/triggerVideoResizingTo360p/triggerVideoResizingTo360pLambdaHandler.ts`,
      environment: lambdaEnvironment,
      role: lambdaRole as iam.IRole,
      vpc: vpc as ec2.IVpc,
    });

    triggerVideoResizingTo360pLambda.addEventSource(
      new lambdaSources.SqsEventSource(resizeVideoTo360pQueue, {
        batchSize: 1,
      }),
    );

    const triggerVideoResizingTo480pLambda = new NodejsLambdaFunction(this, 'TriggerVideoResizingTo480pLambda', {
      entry: `${process.cwd()}/src/stacks/videoProcessing/lambdas/triggerVideoResizingTo480p/triggerVideoResizingTo480pLambdaHandler.ts`,
      environment: lambdaEnvironment,
      vpc: vpc as ec2.IVpc,
    });

    triggerVideoResizingTo480pLambda.addEventSource(
      new lambdaSources.SqsEventSource(resizeVideoTo480pQueue, {
        batchSize: 1,
      }),
    );

    const triggerVideoResizingTo720pLambda = new NodejsLambdaFunction(this, 'TriggerVideoResizingTo720pLambda', {
      entry: `${process.cwd()}/src/stacks/videoProcessing/lambdas/triggerVideoResizingTo720p/triggerVideoResizingTo720pLambdaHandler.ts`,
      environment: lambdaEnvironment,
      vpc: vpc as ec2.IVpc,
    });

    triggerVideoResizingTo720pLambda.addEventSource(
      new lambdaSources.SqsEventSource(resizeVideoTo720pQueue, {
        batchSize: 1,
      }),
    );
  }
}
