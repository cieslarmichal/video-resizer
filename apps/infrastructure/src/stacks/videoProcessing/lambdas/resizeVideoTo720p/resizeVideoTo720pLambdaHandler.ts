import { type Handler, type SNSMessage, type S3Event, type SQSEvent } from 'aws-lambda';

export const lambda: Handler = async (sqsEvent: SQSEvent): Promise<void> => {
  const eventActions = sqsEvent.Records.map(async (sqsRecord) => {
    const snsMessage = JSON.parse(sqsRecord.body) as SNSMessage;

    const s3Event = JSON.parse(snsMessage.Message) as S3Event;

    const s3EventRecord = s3Event.Records[0];

    console.log(s3EventRecord);
  });

  await Promise.all(eventActions);
};
