// ---------------------------------------
// Email: xyz@pqr.com
// Templates: /templates
// (c) 2024 /mit-license
// ---------------------------------------
import { User } from './user.model';

export class UserEdit extends User {

  // ─── Password helper fields ─────────────────────────────────────────────────
  currentPassword?: string;
  newPassword?:     string;
  confirmPassword?: string;

  constructor(
    currentPassword?: string,
    newPassword?: string,
    confirmPassword?: string,
  ) {
    super();
    this.currentPassword   = currentPassword;
    this.newPassword       = newPassword;
    this.confirmPassword   = confirmPassword;
  }
}
