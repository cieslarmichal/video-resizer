import { type S3Event, type SNSMessage, type SQSEvent } from 'aws-lambda';

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
          context: { sqsRecord },
        });

        const snsMessage = JSON.parse(sqsRecord.body) as SNSMessage;

        const s3Event = JSON.parse(snsMessage.Message) as S3Event;

        const s3EventRecord = s3Event.Records[0];

        this.loggerService.debug({
          message: 'Processing S3 event...',
          context: { s3EventRecord },
        });
      }),
    );
  }
}
