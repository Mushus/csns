import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda'; // Keep for Runtime, FunctionUrlAuthType
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as path from 'path'; // For path.join

export class ActivityPubStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Amazon DynamoDB Table
    const table = new dynamodb.Table(this, 'ActivityPubTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, // On-demand capacity
      tableName: 'ActivityPubTable', // Explicit table name
      removalPolicy: cdk.RemovalPolicy.DESTROY, // DESTROY for testing, RETAIN or SNAPSHOT for production
    });

    // AWS Lambda Function using NodejsFunction
    const func = new nodejs.NodejsFunction(this, 'ActivityPubLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: path.join(__dirname, '../../../../src/index.ts'), // Correct path from cdk/lib to src/index.ts
      handler: 'handler', // The exported handler function name in src/index.ts
      // Optional: specify bundling options if needed, e.g.,
      // bundling: {
      //   externalModules: ['aws-sdk'], // Exclude AWS SDK as it's available in Lambda
      //   minify: true, // Minify code
      //   sourceMap: true, // Include source maps
      // },
      environment: { // Pass environment variables to Lambda
        ACTIVITYPUB_TABLE_NAME: table.tableName,
      },
    });

    // Grant the Lambda function read/write permissions to the DynamoDB table
    table.grantReadWriteData(func);

    // Lambda Function URL
    const funcUrl = func.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE, // Or AWS_IAM if you want to restrict access
    });

    // Amazon S3 Bucket
    const bucket = new s3.Bucket(this, 'ActivityPubBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // DESTROY for testing, RETAIN for production
      autoDeleteObjects: true, // For testing, remove objects when stack is deleted
    });

    // Amazon CloudFront Distribution
    const distribution = new cloudfront.Distribution(this, 'ActivityPubDistribution', {
      defaultBehavior: {
        origin: new origins.FunctionUrlOrigin(funcUrl),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED, // No caching for dynamic content
      },
      comment: 'CloudFront distribution for ActivityPub service',
    });

    // Output the CloudFront distribution domain name
    new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: distribution.distributionDomainName,
    });

    // Output the Lambda Function URL
    new cdk.CfnOutput(this, 'LambdaFunctionUrl', {
      value: funcUrl.url,
    });

     // Output the S3 bucket name
     new cdk.CfnOutput(this, 'S3BucketName', {
      value: bucket.bucketName,
    });

    // Output the DynamoDB table name
    new cdk.CfnOutput(this, 'DynamoDBTableName', {
      value: table.tableName,
    });
  }
}
