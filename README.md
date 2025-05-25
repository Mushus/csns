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

(To be filled in later with build, test, and deploy commands)

## Deployment

(To be filled in later with CDK deployment instructions)