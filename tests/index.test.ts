import { describe, it, expect } from 'vitest';
import { handler } from '../src/index';
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';

describe('/health endpoint', () => {
  it('should return { status: "ok", message: "Hono app is running" } with status 200', async () => {
    const event: APIGatewayProxyEventV2 = {
      version: '2.0',
      routeKey: '$default',
      rawPath: '/health',
      requestContext: {
        http: {
          method: 'GET',
          path: '/health',
        },
        accountId: 'anonymous',
        apiId: 'anonymous',
        domainName: 'anonymous',
        domainPrefix: 'anonymous',
        requestId: 'id',
        routeKey: '$default',
        stage: '$default',
        time: '12/Mar/2020:19:03:58 +0000',
        timeEpoch: 1583348638390,
      },
      queryStringParameters: {},
      headers: {},
      isBase64Encoded: false,
    };

    const result = await handler(event) as APIGatewayProxyResultV2;

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body || '{}')).toEqual({ status: 'ok', message: 'Hono app is running' });
  });
});
