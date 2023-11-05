/* eslint-disable import/no-named-as-default */

import { type LoggerOptions, pino } from 'pino';

import { type LoggerClient } from '../../clients/loggerClient/loggerClient.js';
import { type LoggerConfig } from '../../types/loggerConfig.js';

export class LoggerClientFactory {
  public static create(config: LoggerConfig): LoggerClient {
    let loggerClientOptions: LoggerOptions = {
      name: 'Logger',
      level: config.loggerLevel,
    };

    if (config.prettyLogs) {
      loggerClientOptions = {
        ...loggerClientOptions,
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
          },
        },
      };
    }

    const loggerClient = pino(loggerClientOptions);

    return loggerClient;
  }
}
