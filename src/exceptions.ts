import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import * as Sentry from '@sentry/node';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  async catch(exception: unknown, host: ArgumentsHost): Promise<void> {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    // get the request
    const request = host.getArgByIndex(0);

    // log in pod
    console.log(`Error: ${exception}`);

    // log sentry
    Sentry.withScope((scope) => {
      scope.setExtra('body', request?.body);
      scope.setExtra('path', request?.url);
      Sentry.captureException(exception);
    });
    await Sentry.flush(1000);

    // send the response
    const ctx = host.switchToHttp();
    const responseBody = {
      message: 'Something went wrong in an internal enrichment: ' + (exception as Error)?.message
    };
    httpAdapter.reply(ctx.getResponse(), responseBody, 400);
  }
}
