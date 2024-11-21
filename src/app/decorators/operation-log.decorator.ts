import { SetMetadata } from '@nestjs/common';

export const OperationLog = (args: { operation: string }) => SetMetadata('operation-log', args);
