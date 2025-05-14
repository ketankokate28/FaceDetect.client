// ---------------------------------------
// Email: xyz@pqr.com
// Templates: /templates
// (c) 2024 /mit-license
// ---------------------------------------

export class User {
  constructor(
    public id = '',
    public userName = '',
    public fullName = '',
    public email = '',
    public jobTitle = '',
    public phoneNumber = '',
    roles: string[] = [],  

  ) {
    if (roles)
      this.roles = roles;
  }
// New fields with defaults
  public notify_email: boolean = true;
  public notify_sms: boolean = true;
  public notify_call: boolean = true;
  public priority_email: number = 0;
  public priority_sms: number = 0;
  public priority_call: number = 0;
  public is_active: boolean = true;
  public created_at?: string;
  get friendlyName() {
    let name = this.fullName || this.userName;

    if (this.jobTitle) {
      name = this.jobTitle + ' ' + name;
    }

    return name;
  }

  public isEnabled = true;
  public isLockedOut = false;
  public roles: string[] = [];
}
