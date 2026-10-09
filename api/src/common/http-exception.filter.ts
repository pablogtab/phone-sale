import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { PublicException } from './public.exception';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const _public = exception instanceof PublicException;
    const validationErrors = exception.getResponse() as any;

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      public: _public,
      validationErrors: validationErrors?.message,
    });
  }
}
