import { Application, type Video360pQueueController, videoSymbols } from '@video-resizer/backend';
import { type Handler, type SQSEvent } from 'aws-lambda';

const container = Application.createContainer();

const video360pQueueController = container.get<Video360pQueueController>(videoSymbols.video360pQueueController);

export const lambda: Handler = async (sqsEvent: SQSEvent): Promise<void> => {
  await video360pQueueController.handleEvent(sqsEvent);
};
