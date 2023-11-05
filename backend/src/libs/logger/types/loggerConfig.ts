import { type LoggerLevel } from './loggerLevel.js';

export interface LoggerConfig {
  readonly loggerLevel: LoggerLevel;
  readonly prettyLogs: boolean;
}
