# ActivityPub Server (Minimal Implementation)

This project is a minimal implementation of an ActivityPub server using:

*   TypeScript
*   Hono (for the server framework)
*   AWS CDK (for infrastructure as code)
*   AWS Lambda, DynamoDB, S3, CloudFront
*   Valibot (for data validation)
*   Vitest (for testing)
*   pnpm (as package manager)

## Project Structure

*   `src/`: Application code (Hono server, ActivityPub logic)
*   `cdk/`: AWS CDK infrastructure code (actually `cdk/cdk/` due to `cdk init` behavior)
*   `tests/`: Vitest tests
*   `package.json`: Project dependencies and scripts
*   `tsconfig.json`: TypeScript configuration
*   `vitest.config.ts`: Vitest configuration

## Development

To run the server locally for development, use the following command:

```bash
pnpm dev
```

This will start a local development server on `http://localhost:3000`. 
The server will automatically reload when code changes are made.

When running locally, development-specific routes are available. For example, you can access:
- `http://localhost:3000/dev/test` - A simple test endpoint for development.
- `http://localhost:3000/health` - The standard health check endpoint.

(Further details on build, test, and general deploy commands to be filled in later)

## Deployment

(To be filled in later with CDK deployment instructions)