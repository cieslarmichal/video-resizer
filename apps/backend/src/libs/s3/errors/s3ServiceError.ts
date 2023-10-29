import { BaseError } from '../../../common/errors/base/baseError.js';

interface Context {
  readonly bucket: string;
  readonly objectKey: string;
  readonly [key: string]: unknown;
}

export class S3ServiceError extends BaseError<Context> {
  public constructor(context: Context) {
    super('S3ServiceError', 'S3 service error.', context);
  }
}
