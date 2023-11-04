import { LoggerLevel } from '@video-resizer/backend';
import * as core from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaSources from 'aws-cdk-lib/aws-lambda-event-sources';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as snsSubscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as sqs from 'aws-cdk-lib/aws-sqs';

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

    const lambdaEnvironment = {
      ['S3_RESIZED_VIDEOS_BUCKET']: s3ResizedVideosBucket.bucketName,
      ['LOGGER_LEVEL']: LoggerLevel.debug,
      ['FFMPEG_PATH']: '/opt/ffmpeg',
    };

    const ffmegLayer = new lambda.LayerVersion(this, 'ffmpeg-layer', {
      layerVersionName: 'ffmpeg',
      compatibleRuntimes: [lambda.Runtime.NODEJS_18_X],
      code: lambda.AssetCode.fromAsset(`${process.cwd()}/src/stacks/videoProcessing/ffmpegLambdaLayer`),
    });

    const resizeVideoTo360pLambda = new NodejsLambdaFunction(this, 'ResizeVideoTo360pLambda', {
      entry: `${process.cwd()}/src/stacks/videoProcessing/lambdas/resizeVideoTo360p/resizeVideoTo360pLambdaHandler.ts`,
      environment: lambdaEnvironment,
      layers: [ffmegLayer],
    });

    s3VideosBucket.grantRead(resizeVideoTo360pLambda);

    s3ResizedVideosBucket.grantReadWrite(resizeVideoTo360pLambda);

    resizeVideoTo360pLambda.addEventSource(
      new lambdaSources.SqsEventSource(resizeVideoTo360pQueue, {
        batchSize: 1,
      }),
    );

    const resizeVideoTo480pLambda = new NodejsLambdaFunction(this, 'ResizeVideoTo480pLambda', {
      entry: `${process.cwd()}/src/stacks/videoProcessing/lambdas/resizeVideoTo480p/resizeVideoTo480pLambdaHandler.ts`,
      environment: lambdaEnvironment,
      layers: [ffmegLayer],
    });

    s3VideosBucket.grantRead(resizeVideoTo480pLambda);

    s3ResizedVideosBucket.grantReadWrite(resizeVideoTo480pLambda);

    resizeVideoTo480pLambda.addEventSource(
      new lambdaSources.SqsEventSource(resizeVideoTo480pQueue, {
        batchSize: 1,
      }),
    );

    const resizeVideoTo720pLambda = new NodejsLambdaFunction(this, 'ResizeVideoTo720pLambda', {
      entry: `${process.cwd()}/src/stacks/videoProcessing/lambdas/resizeVideoTo720p/resizeVideoTo720pLambdaHandler.ts`,
      environment: lambdaEnvironment,
      layers: [ffmegLayer],
    });

    s3VideosBucket.grantRead(resizeVideoTo720pLambda);

    s3ResizedVideosBucket.grantReadWrite(resizeVideoTo720pLambda);

    resizeVideoTo720pLambda.addEventSource(
      new lambdaSources.SqsEventSource(resizeVideoTo720pQueue, {
        batchSize: 1,
      }),
    );
  }
}
