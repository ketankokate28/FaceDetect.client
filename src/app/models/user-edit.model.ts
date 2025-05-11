// ---------------------------------------
// Email: xyz@pqr.com
// Templates: /templates
// (c) 2024 /mit-license
// ---------------------------------------

import { User } from './user.model';

export class UserEdit extends User {
  constructor(
    public currentPassword?: string,
    public newPassword?: string,
    public confirmPassword?: string) {
    super();
  }
}
