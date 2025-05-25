import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';

export class ActivityPubStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // AWS Lambda Function
    const func = new lambda.Function(this, 'ActivityPubLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline('exports.handler = async () => { console.log("Hello from Lambda!"); return { statusCode: 200, body: "Hello from Lambda!" }; };'),
    });

    // Lambda Function URL
    const funcUrl = func.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE, // Or AWS_IAM if you want to restrict access
    });

    // Amazon DynamoDB Table
    const table = new dynamodb.Table(this, 'ActivityPubTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, // On-demand capacity
      tableName: 'ActivityPubTable',
      removalPolicy: cdk.RemovalPolicy.DESTROY, // DESTROY for testing, RETAIN or SNAPSHOT for production
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
