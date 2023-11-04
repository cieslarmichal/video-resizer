import { type S3Event, type SNSMessage, type SQSEvent } from 'aws-lambda';

import { VideoResolution } from '../../../../../common/types/videoResolution.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type UploadResizedVideoCommandHandler } from '../../../application/commandHandlers/uploadResizedVideoCommandHandler/uploadResizedVideoCommandHandler.js';

export class Video720pQueueController {
  public constructor(
    private readonly uploadResizedVideoCommandHandler: UploadResizedVideoCommandHandler,
    private readonly loggerService: LoggerService,
  ) {}

  public async handleEvent(sqsEvent: SQSEvent): Promise<void> {
    await Promise.all(
      sqsEvent.Records.map(async (sqsRecord) => {
        this.loggerService.debug({
          message: 'Processing SQS event...',
          context: { body: sqsRecord.body },
        });

        const snsMessage = JSON.parse(sqsRecord.body) as SNSMessage;

        const snsParsedMessage = JSON.parse(snsMessage.Message);

        const s3Event = snsParsedMessage as S3Event;

        if (!s3Event) {
          this.loggerService.warn({
            message: 'S3 event not found.',
            context: { snsParsedMessage },
          });

          return;
        }

        const s3EventRecord = s3Event.Records[0];

        if (!s3EventRecord) {
          this.loggerService.warn({
            message: 'S3 event record not found.',
            context: { s3Event },
          });

          return;
        }

        const eventName = s3EventRecord.eventName;

        const bucket = s3EventRecord.s3.bucket.name;

        const objectKey = s3EventRecord.s3.object.key;

        this.loggerService.debug({
          message: 'Processing S3 event...',
          context: {
            eventName,
            objectKey,
            bucket,
          },
        });

        if (!s3EventRecord.eventName.includes('ObjectCreated')) {
          this.loggerService.debug({
            message: 'S3 object is not created, stopping execution.',
            context: {
              eventName,
            },
          });

          return;
        }

        await this.uploadResizedVideoCommandHandler.execute({
          s3VideosBucket: bucket,
          s3VideoKey: objectKey,
          resolution: VideoResolution.highDefinition,
        });

        this.loggerService.debug({
          message: 'S3 event processed.',
          context: {
            eventName,
            objectKey,
            bucket,
          },
        });
      }),
    );
  }
}
