import { Application, type Video480pQueueController, videoSymbols } from '@video-resizer/backend';
import { type Handler, type SQSEvent } from 'aws-lambda';

const container = Application.createContainer();

const video480pQueueController = container.get<Video480pQueueController>(videoSymbols.video480pQueueController);

export const lambda: Handler = async (sqsEvent: SQSEvent): Promise<void> => {
  await video480pQueueController.handleEvent(sqsEvent);
};
