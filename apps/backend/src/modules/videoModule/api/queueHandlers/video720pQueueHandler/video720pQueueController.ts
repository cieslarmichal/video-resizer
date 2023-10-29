import { type S3Event, type SNSMessage, type SQSEvent } from 'aws-lambda';

export class Video720pQueueController {
  public async handleEvent(sqsEvent: SQSEvent): Promise<void> {
    await Promise.all(
      sqsEvent.Records.map(async (sqsRecord) => {
        const snsMessage = JSON.parse(sqsRecord.body) as SNSMessage;

        const s3Event = JSON.parse(snsMessage.Message) as S3Event;

        const s3EventRecord = s3Event.Records[0];

        console.log(s3EventRecord);
      }),
    );
  }
}
