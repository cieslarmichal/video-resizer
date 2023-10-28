/* eslint-disable import/no-named-as-default */

import { pino } from 'pino';

import { type LoggerClient } from '../../clients/loggerClient/loggerClient.js';
import { type LoggerConfig } from '../../types/loggerConfig.js';

export class LoggerClientFactory {
  public static create(config: LoggerConfig): LoggerClient {
    const loggerClient = pino({
      name: 'Logger',
      level: config.loggerLevel,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
        },
      },
    });

    return loggerClient;
  }
}
