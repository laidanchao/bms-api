import { createLogger } from 'winston';
import * as winston from 'winston';

export const Logger = createLogger({
  exitOnError: false,
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      level: 'info',
    }),
  ],
});
