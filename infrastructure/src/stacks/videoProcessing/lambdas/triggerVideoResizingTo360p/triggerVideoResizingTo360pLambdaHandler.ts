import { ECS } from '@aws-sdk/client-ecs';
import { type SNSMessage, type Handler, type SQSEvent, type S3Event } from 'aws-lambda';

const ecs = new ECS();

export const lambda: Handler = async (sqsEvent: SQSEvent): Promise<void> => {
  await Promise.all(
    sqsEvent.Records.map(async (sqsRecord) => {
      console.log({
        message: 'Processing SQS event...',
        context: { body: sqsRecord.body },
      });

      const snsMessage = JSON.parse(sqsRecord.body) as SNSMessage;

      const snsParsedMessage = JSON.parse(snsMessage.Message);

      const s3Event = snsParsedMessage as S3Event;

      if (!s3Event) {
        console.log({
          message: 'S3 event not found.',
          context: { snsParsedMessage },
        });

        return;
      }

      const s3EventRecord = s3Event.Records[0];

      if (!s3EventRecord) {
        console.log({
          message: 'S3 event record not found.',
          context: { s3Event },
        });

        return;
      }

      const eventName = s3EventRecord.eventName;

      const bucket = s3EventRecord.s3.bucket.name;

      const objectKey = s3EventRecord.s3.object.key;

      console.log({
        message: 'Processing S3 event...',
        context: {
          eventName,
          objectKey,
          bucket,
        },
      });

      if (!s3EventRecord.eventName.includes('ObjectCreated')) {
        console.log({
          message: 'S3 object is not created, stopping execution.',
          context: {
            eventName,
          },
        });

        return;
      }

      await ecs.runTask({
        cluster: process.env['ECS_CLUSTER_ARN'] as string,
        taskDefinition: process.env['ECS_TASK_ARN'],
        networkConfiguration: {
          awsvpcConfiguration: {
            subnets: (process.env['SUBNET_IDS'] as string).split(','),
            assignPublicIp: 'DISABLED',
          },
        },
        overrides: {
          containerOverrides: [
            {
              name: process.env['ECS_CONTAINER_NAME'] as string,
              environment: [
                {
                  name: 'FFMPEG_PATH',
                  value: '/usr/bin/ffmpeg',
                },
                {
                  name: 'S3_RESIZED_VIDEOS_BUCKET',
                  value: process.env['S3_RESIZED_VIDEOS_BUCKET'] as string,
                },
                {
                  name: 'TARGET_RESOLUTION',
                  value: '360p',
                },
              ],
            },
          ],
        },
        count: 1,
        launchType: 'FARGATE',
      });

      console.log({
        message: 'S3 event processed.',
        context: {
          eventName,
          objectKey,
          bucket,
        },
      });
    }),
  );
};
