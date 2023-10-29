import * as core from 'aws-cdk-lib';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as lambdaSources from 'aws-cdk-lib/aws-lambda-event-sources';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as snsSubscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as sqs from 'aws-cdk-lib/aws-sqs';

import { NodejsLambdaFunction } from '../../common/nodejsLambdaFunction';

export class VideoProcessingStack extends core.Stack {
  public constructor(scope: core.App, id: string, props: core.StackProps) {
    super(scope, id, props);

    const s3Bucket = new s3.Bucket(this, 'videos', {
      objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_ENFORCED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryptionKey: new kms.Key(this, 's3BucketKMSKey'),
      removalPolicy: core.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const topic = new sns.Topic(this, 'CreatedVideos');

    s3Bucket.addEventNotification(s3.EventType.OBJECT_CREATED, new s3n.SnsDestination(topic));

    const resizeVideoTo360pQueue = new sqs.Queue(this, 'ResizeVideoTo360pQueue', {
      queueName: 'ResizeVideoTo360pQueue',
      visibilityTimeout: core.Duration.seconds(30),
    });

    topic.addSubscription(new snsSubscriptions.SqsSubscription(resizeVideoTo360pQueue));

    const resizeVideoTo480pQueue = new sqs.Queue(this, 'ResizeVideoTo480pQueue', {
      queueName: 'ResizeVideoTo480pQueue',
      visibilityTimeout: core.Duration.seconds(30),
    });

    topic.addSubscription(new snsSubscriptions.SqsSubscription(resizeVideoTo480pQueue));

    const resizeVideoTo720pQueue = new sqs.Queue(this, 'ResizeVideoTo720pQueue', {
      queueName: 'ResizeVideoTo720pQueue',
      visibilityTimeout: core.Duration.seconds(30),
    });

    topic.addSubscription(new snsSubscriptions.SqsSubscription(resizeVideoTo720pQueue));

    const lambdaEnvironment = {
      ['S3_BUCKET_NAME']: s3Bucket.bucketName,
    };

    const createLambdaEntryPath = (path: string): string => {
      return `${process.cwd()}/src/stacks/videoProcessing/lambdas/${path}`;
    };

    const resizeVideoTo360pLambda = new NodejsLambdaFunction(this, 'ResizeVideoTo360pLambda', {
      entry: createLambdaEntryPath('resizeVideoTo360p/resizeVideoTo360pLambdaHandler.ts'),
      environment: lambdaEnvironment,
    });

    s3Bucket.grantRead(resizeVideoTo360pLambda);

    resizeVideoTo360pLambda.addEventSource(
      new lambdaSources.SqsEventSource(resizeVideoTo360pQueue, {
        batchSize: 1,
      }),
    );

    const resizeVideoTo480pLambda = new NodejsLambdaFunction(this, 'ResizeVideoTo480pLambda', {
      entry: createLambdaEntryPath('resizeVideoTo480p/resizeVideoTo480pLambdaHandler.ts'),
      environment: lambdaEnvironment,
    });

    s3Bucket.grantRead(resizeVideoTo480pLambda);

    resizeVideoTo480pLambda.addEventSource(
      new lambdaSources.SqsEventSource(resizeVideoTo480pQueue, {
        batchSize: 1,
      }),
    );

    const resizeVideoTo720pLambda = new NodejsLambdaFunction(this, 'ResizeVideoTo720pLambda', {
      entry: createLambdaEntryPath('resizeVideoTo720p/resizeVideoTo720pLambdaHandler.ts'),
      environment: lambdaEnvironment,
    });

    s3Bucket.grantRead(resizeVideoTo720pLambda);

    resizeVideoTo720pLambda.addEventSource(
      new lambdaSources.SqsEventSource(resizeVideoTo720pQueue, {
        batchSize: 1,
      }),
    );
  }
}
