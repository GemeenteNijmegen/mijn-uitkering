import { aws_iam as IAM, aws_kms as KMS, Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';

/**
 * For session storage a sessions-table is created in dynamoDB. Session
 * state is maintained by relating an opaque session cookie value to this table.
 */
export class KeyStack extends Stack {
    key: KMS.Key;
    logKey: KMS.Key;
    constructor(scope: Construct, id: string) {
        super(scope, id);
        this.key = new KMS.Key(this, 'kmskey', {
            enableKeyRotation: true,
            description: 'encryption key for Mijn Nijmegen'
        });
        this.key.addAlias('mijn');

        this.logKey = new KMS.Key(this, 'logkey', {
            enableKeyRotation: true,
            description: 'encryption key for Mijn Nijmegen logging'
        });
        this.key.addAlias('mijn-logs');
    }

    setPolicies() {
        this.key.addToResourcePolicy(new IAM.PolicyStatement({
            sid: 'Allow direct access to key metadata to the account',
            effect: IAM.Effect.ALLOW,
            principals: [new IAM.AccountRootPrincipal],
            actions: [
                'kms:Describe*',
                'kms:Get*',
                'kms:List*',
                'kms:RevokeGrant',
            ],
            resources: ['*'], // Wildcard '*' required
        }));
        
        this.key.addToResourcePolicy(new IAM.PolicyStatement({
            sid: 'Allow DynamoDB to directly describe the key',
            effect: IAM.Effect.ALLOW,
            principals: [new IAM.ServicePrincipal('dynamodb.amazonaws.com')],
            actions: [
                'kms:Describe*',
                'kms:Get*',
                'kms:List*',
            ],
            resources: ['*'], // Wildcard '*' required
        }));
    }
}