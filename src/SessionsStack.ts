import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { SessionsTable } from './SessionsTable';

/**
 * For session storage a sessions-table is created in dynamoDB. Session
 * state is maintained by relating an opaque session cookie value to this table.
 */

export class SessionsStack extends Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id);
    new SessionsTable(this, 'sessions-table');
  }
}
