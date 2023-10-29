import * as core from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, type NodejsFunctionProps, OutputFormat } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as logs from 'aws-cdk-lib/aws-logs';
import { type Construct } from 'constructs';

export class NodejsLambdaFunction extends NodejsFunction {
  public constructor(scope: Construct, id: string, props: NodejsFunctionProps) {
    super(scope, id, {
      handler: 'lambda',
      bundling: {
        minify: true,
        target: 'node16',
        format: OutputFormat.ESM,
        banner: "import { createRequire } from 'module';const require = createRequire(import.meta.url);",
      },
      architecture: lambda.Architecture.ARM_64,
      runtime: lambda.Runtime.NODEJS_16_X,
      memorySize: 1024,
      tracing: lambda.Tracing.ACTIVE,
      awsSdkConnectionReuse: true,
      timeout: core.Duration.minutes(3),
      logRetention: logs.RetentionDays.THREE_DAYS,
      ...props,
    });
  }
}
