import { Application, type Video720pQueueController, videoSymbols } from '@video-resizer/backend';
import { type Handler, type SQSEvent } from 'aws-lambda';

const container = Application.createContainer();

const video720pQueueController = container.get<Video720pQueueController>(videoSymbols.video720pQueueController);

export const lambda: Handler = async (sqsEvent: SQSEvent): Promise<void> => {
  await video720pQueueController.handleEvent(sqsEvent);
};
