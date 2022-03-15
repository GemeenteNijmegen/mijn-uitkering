import { aws_kms as KMS, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { SessionsTable } from './SessionsTable';

export interface SessionStackProps extends StackProps {
  key: KMS.Key
}

export class SessionsStack extends Stack {
  sessionsTable : SessionsTable;

  /**
   * For session storage a sessions-table is created in dynamoDB. Session
   * state is maintained by relating an opaque session cookie value to this table.
   */
 constructor(scope: Construct, id: string, props: SessionStackProps) {
    super(scope, id, props);
    this.sessionsTable = new SessionsTable(this, 'sessions-table', { key: props.key });
  }
}
