import {
  createUrlRecordBodySchema,
  createUrlRecordResponseCreatedBodySchema,
  type CreateUrlRecordBody,
  type CreateUrlRecordResponseCreatedBody,
} from './schemas/createUrlRecordSchema.js';
import {
  findLongUrlPathParametersSchema,
  type FindLongUrlPathParameters,
  type FindLongUrlResponseMovedTemporarilyBody,
  findLongUrlResponseMovedTemporarilyBodySchema,
} from './schemas/findLongUrlSchema.js';
import { type UrlRecordDto } from './schemas/urlRecordDto.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type HttpController } from '../../../../../common/types/http/httpController.js';
import { HttpHeader } from '../../../../../common/types/http/httpHeader.js';
import { HttpMethodName } from '../../../../../common/types/http/httpMethodName.js';
import { type HttpRequest } from '../../../../../common/types/http/httpRequest.js';
import {
  type HttpCreatedResponse,
  type HttpNotFoundResponse,
  type HttpMovedTemporarilyResponse,
} from '../../../../../common/types/http/httpResponse.js';
import { HttpRoute } from '../../../../../common/types/http/httpRoute.js';
import { HttpStatusCode } from '../../../../../common/types/http/httpStatusCode.js';
import { responseErrorBodySchema, type ResponseErrorBody } from '../../../../../common/types/http/responseErrorBody.js';
import { type CreateUrlRecordCommandHandler } from '../../../application/commandHandlers/createUrlRecordCommandHandler/createUrlRecordCommandHandler.js';
import { type FindLongUrlQueryHandler } from '../../../application/queryHandlers/findLongUrlQueryHandler/findLongUrlQueryHandler.js';
import { type UrlRecord } from '../../../domain/entities/urlRecord/urlRecord.js';
import { type UrlModuleConfig } from '../../../urlModuleConfig.js';

export class UrlHttpController implements HttpController {
  public readonly basePath = '';

  public constructor(
    private readonly createUrlRecordCommandHandler: CreateUrlRecordCommandHandler,
    private readonly findLongUrlQueryHandler: FindLongUrlQueryHandler,
    private readonly config: UrlModuleConfig,
  ) {}

  public getHttpRoutes(): HttpRoute[] {
    return [
      new HttpRoute({
        path: '/urls',
        method: HttpMethodName.post,
        handler: this.createUrlRecord.bind(this),
        schema: {
          request: {
            body: createUrlRecordBodySchema,
          },
          response: {
            [HttpStatusCode.created]: {
              schema: createUrlRecordResponseCreatedBodySchema,
              description: 'UrlRecord created.',
            },
            [HttpStatusCode.unprocessableEntity]: {
              schema: responseErrorBodySchema,
              description: 'Error exception.',
            },
          },
        },
        tags: ['UrlRecord'],
        description: 'Create UrlRecord.',
      }),
      new HttpRoute({
        method: HttpMethodName.get,
        path: ':shortUrlPathParam',
        handler: this.findUrlRecord.bind(this),
        schema: {
          request: {
            pathParams: findLongUrlPathParametersSchema,
          },
          response: {
            [HttpStatusCode.movedTemporarily]: {
              schema: findLongUrlResponseMovedTemporarilyBodySchema,
              description: 'Long url found.',
            },
            [HttpStatusCode.notFound]: {
              schema: responseErrorBodySchema,
              description: 'Error exception.',
            },
          },
        },
        tags: ['UrlRecord'],
        description: 'Find long url by short url.',
      }),
    ];
  }

  private async createUrlRecord(
    request: HttpRequest<CreateUrlRecordBody>,
  ): Promise<HttpCreatedResponse<CreateUrlRecordResponseCreatedBody>> {
    const { url } = request.body;

    const { urlRecord } = await this.createUrlRecordCommandHandler.execute({ longUrl: url });

    return {
      statusCode: HttpStatusCode.created,
      body: { urlRecord: this.mapUrlRecordToDto(urlRecord) },
    };
  }

  private async findUrlRecord(
    request: HttpRequest<undefined, undefined, FindLongUrlPathParameters>,
  ): Promise<
    HttpMovedTemporarilyResponse<FindLongUrlResponseMovedTemporarilyBody> | HttpNotFoundResponse<ResponseErrorBody>
  > {
    const { shortUrlPathParam } = request.pathParams;

    const host = request.headers[HttpHeader.host] || (request.headers[HttpHeader.host.toLowerCase()] as string);

    const { domainUrl } = this.config;

    const shortUrl = `${domainUrl}/${shortUrlPathParam}`;

    try {
      const { longUrl } = await this.findLongUrlQueryHandler.execute({
        shortUrl,
        clientIp: host,
      });

      return {
        statusCode: HttpStatusCode.movedTemporarily,
        body: null,
        headers: {
          [HttpHeader.location]: longUrl,
        },
      };
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        return {
          statusCode: HttpStatusCode.notFound,
          body: { error },
        };
      }

      throw error;
    }
  }

  private mapUrlRecordToDto(urlRecord: UrlRecord): UrlRecordDto {
    return {
      createdAt: urlRecord.getCreatedAt().toISOString(),
      longUrl: urlRecord.getLongUrl(),
      shortUrl: urlRecord.getShortUrl(),
    };
  }
}
