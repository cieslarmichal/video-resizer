/* eslint-disable @typescript-eslint/naming-convention */

import * as core from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as cloudwatchActions from 'aws-cdk-lib/aws-cloudwatch-actions';
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

interface VideoProcessingStackProps extends core.StackProps {
  readonly alertEmail: string;
}

export class VideoProcessingStack extends core.Stack {
  public constructor(scope: core.App, id: string, props: VideoProcessingStackProps) {
    super(scope, id, props);

    const { alertEmail } = props;

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

    const createdVideosTopic = new sns.Topic(this, 'CreatedVideos');

    s3VideosBucket.addEventNotification(s3.EventType.OBJECT_CREATED, new s3n.SnsDestination(createdVideosTopic));

    const resizeVideoTo360pQueue = new sqs.Queue(this, 'ResizeVideoTo360pQueue', {
      queueName: 'ResizeVideoTo360pQueue',
      visibilityTimeout: core.Duration.minutes(15),
    });

    createdVideosTopic.addSubscription(new snsSubscriptions.SqsSubscription(resizeVideoTo360pQueue));

    const resizeVideoTo480pQueue = new sqs.Queue(this, 'ResizeVideoTo480pQueue', {
      queueName: 'ResizeVideoTo480pQueue',
      visibilityTimeout: core.Duration.minutes(15),
    });

    createdVideosTopic.addSubscription(new snsSubscriptions.SqsSubscription(resizeVideoTo480pQueue));

    const resizeVideoTo720pQueue = new sqs.Queue(this, 'ResizeVideoTo720pQueue', {
      queueName: 'ResizeVideoTo720pQueue',
      visibilityTimeout: core.Duration.minutes(15),
    });

    createdVideosTopic.addSubscription(new snsSubscriptions.SqsSubscription(resizeVideoTo720pQueue));

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
      cpu: '1024',
      memoryMiB: '2048',
    });

    ecsTaskDefinition.addToTaskRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['s3:*', 'ecs:*'],
        resources: ['*'],
      }),
    );

    const asset = new ecrAssets.DockerImageAsset(this, 'AppDockerImage', {
      directory: join(process.cwd(), '..', 'backend'),
    });

    const container = new ecs.ContainerDefinition(this, 'Container', {
      image: ecs.ContainerImage.fromDockerImageAsset(asset),
      taskDefinition: ecsTaskDefinition,
      logging: ecs.LogDriver.awsLogs({ streamPrefix: 'container-logs' }),
    });

    const lambdaRole = new iam.Role(this, 'LambdaRole', {
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
          ],
        }),
      },
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')],
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
    });

    triggerVideoResizingTo360pLambda.addEventSource(
      new lambdaSources.SqsEventSource(resizeVideoTo360pQueue, {
        batchSize: 1,
      }),
    );

    const triggerVideoResizingTo480pLambda = new NodejsLambdaFunction(this, 'TriggerVideoResizingTo480pLambda', {
      entry: `${process.cwd()}/src/stacks/videoProcessing/lambdas/triggerVideoResizingTo480p/triggerVideoResizingTo480pLambdaHandler.ts`,
      environment: lambdaEnvironment,
      role: lambdaRole as iam.IRole,
    });

    triggerVideoResizingTo480pLambda.addEventSource(
      new lambdaSources.SqsEventSource(resizeVideoTo480pQueue, {
        batchSize: 1,
      }),
    );

    const triggerVideoResizingTo720pLambda = new NodejsLambdaFunction(this, 'TriggerVideoResizingTo720pLambda', {
      entry: `${process.cwd()}/src/stacks/videoProcessing/lambdas/triggerVideoResizingTo720p/triggerVideoResizingTo720pLambdaHandler.ts`,
      environment: lambdaEnvironment,
      role: lambdaRole as iam.IRole,
    });

    triggerVideoResizingTo720pLambda.addEventSource(
      new lambdaSources.SqsEventSource(resizeVideoTo720pQueue, {
        batchSize: 1,
      }),
    );

    const alarmTopic = new sns.Topic(this, 'Alarm topic', { displayName: `video-processing-alarm-topic` });

    alarmTopic.addSubscription(new snsSubscriptions.EmailSubscription(alertEmail));

    const cpuPercentUsed = new cloudwatch.MathExpression({
      expression: 'utilized / reserved',
      usingMetrics: {
        utilized: new cloudwatch.Metric({
          namespace: 'ECS/ContainerInsights',
          metricName: 'CpuUtilized',
          statistic: 'Average',
          period: core.Duration.minutes(1),
          dimensionsMap: { ClusterName: cluster.clusterName },
        }),
        reserved: new cloudwatch.Metric({
          namespace: 'ECS/ContainerInsights',
          metricName: 'CpuReserved',
          statistic: 'Average',
          period: core.Duration.minutes(1),
          dimensionsMap: { ClusterName: cluster.clusterName },
        }),
      },
    });

    const highCpuAlarm = new cloudwatch.Alarm(this, 'HighCpuAlarm', {
      metric: cpuPercentUsed,
      threshold: 0.85,
      evaluationPeriods: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
    });

    const memoryPercentUsed = new cloudwatch.MathExpression({
      expression: 'utilized / reserved',
      usingMetrics: {
        utilized: new cloudwatch.Metric({
          namespace: 'ECS/ContainerInsights',
          metricName: 'MemoryUtilized',
          statistic: 'Average',
          period: core.Duration.minutes(1),
          dimensionsMap: { ClusterName: cluster.clusterName },
        }),
        reserved: new cloudwatch.Metric({
          namespace: 'ECS/ContainerInsights',
          metricName: 'MemoryReserved',
          statistic: 'Average',
          period: core.Duration.minutes(1),
          dimensionsMap: { ClusterName: cluster.clusterName },
        }),
      },
    });

    const highMemoryAlarm = new cloudwatch.Alarm(this, 'HighMemoryAlarm', {
      metric: memoryPercentUsed,
      threshold: 0.85,
      evaluationPeriods: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
    });

    highMemoryAlarm.addAlarmAction(new cloudwatchActions.SnsAction(alarmTopic));

    highCpuAlarm.addAlarmAction(new cloudwatchActions.SnsAction(alarmTopic));
  }
}
