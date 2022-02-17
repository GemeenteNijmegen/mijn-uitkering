import { Distribution, PriceClass } from "aws-cdk-lib/aws-cloudfront";
import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { HttpOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
export interface CloudfrontStackProps extends StackProps {
    ApiGatewayDomain: string;
}

export class CloudfrontStack extends Stack {
    constructor(scope: Construct, id: string, props: CloudfrontStackProps) {
        super(scope, id, props);
        
        new Distribution(this, 'cf-distribution', {
            priceClass: PriceClass.PRICE_CLASS_100,
            defaultBehavior: {
                origin: new HttpOrigin(props.ApiGatewayDomain)
            }
        });
    }
}