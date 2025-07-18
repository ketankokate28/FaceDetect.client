// ---------------------------------------
// Email: xyz@pqr.com
// Templates: /templates
// (c) 2024 /mit-license
// ---------------------------------------

import { Injectable, inject } from '@angular/core';
import { Observable, Subject, forkJoin, throwError } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';

import { AccountEndpoint } from './account-endpoint.service';
import { AuthService } from './auth.service';
import { User } from '../models/user.model';
import { Role } from '../models/role.model';
import { Permission, PermissionValues } from '../models/permission.model';
import { UserEdit } from '../models/user-edit.model';

export type RolesChangedOperation = 'add' | 'delete' | 'modify';
export interface RolesChangedEventArg { roles: Role[] | string[]; operation: RolesChangedOperation; }

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private authService = inject(AuthService);
  private accountEndpoint = inject(AccountEndpoint);

  public static readonly roleAddedOperation: RolesChangedOperation = 'add';
  public static readonly roleDeletedOperation: RolesChangedOperation = 'delete';
  public static readonly roleModifiedOperation: RolesChangedOperation = 'modify';

  private rolesChanged = new Subject<RolesChangedEventArg>();

  getUser(userId?: string) {
    return this.accountEndpoint.getUserEndpoint<User>(userId);
  }

  getUserAndRoles(userId?: string) {
    return forkJoin([
      this.accountEndpoint.getUserEndpoint<User>(userId),
      this.accountEndpoint.getRolesEndpoint<Role[]>()]);
  }

  getUsers(page?: number, pageSize?: number) {
    return this.accountEndpoint.getUsersEndpoint<User[]>(page, pageSize);
  }

  getUsersAndRoles(page?: number, pageSize?: number) {
    return forkJoin([
      this.accountEndpoint.getUsersEndpoint<User[]>(page, pageSize),
      this.accountEndpoint.getRolesEndpoint<Role[]>()]);
  }

  updateUser(user: UserEdit) {
    if (user.id) {
      return this.accountEndpoint.getUpdateUserEndpoint(user, user.id);
    } else {
      return this.accountEndpoint.getUserByUserNameEndpoint<User>(user.userName).pipe(
        mergeMap(foundUser => {
          user.id = foundUser.id;
          return this.accountEndpoint.getUpdateUserEndpoint(user, user.id);
        }));
    }
  }

  newUser(user: UserEdit) {
    return this.accountEndpoint.getNewUserEndpoint<User>(user);
  }

  getUserPreferences() {
    return this.accountEndpoint.getUserPreferencesEndpoint<string>();
  }

  updateUserPreferences(configuration: string | null) {
    return this.accountEndpoint.getUpdateUserPreferencesEndpoint(configuration);
  }

  deleteUser(userOrUserId: number | string | User): Observable<User> {
    if (typeof userOrUserId === 'string' || typeof userOrUserId === 'number') {
      const userIdStr = userOrUserId.toString();
      return this.accountEndpoint.getDeleteUserEndpoint<User>(userIdStr).pipe(
        tap(user => this.onRolesUserCountChanged(user.roles))
      );
    } else if (userOrUserId && typeof userOrUserId === 'object') {
      if (userOrUserId.id) {
        return this.deleteUser(userOrUserId.id);
      } else if (userOrUserId.userName) {
        return this.accountEndpoint.getUserByUserNameEndpoint<User>(userOrUserId.userName).pipe(
          mergeMap(user => this.deleteUser(user.id))
        );
      }
    }
  
    // 🔴 Final fallback return — makes TypeScript happy
    return throwError(() => new Error('Invalid input to deleteUser'));
  }
  
  

  unblockUser(userId: string) {
    return this.accountEndpoint.getUnblockUserEndpoint(userId);
  }

  userHasPermission(permissionValue: PermissionValues): boolean {
    return this.permissions.some(p => p === permissionValue);
    //return true;
  }

  refreshLoggedInUser() {
    return this.accountEndpoint.refreshLogin();
  }

  getRoles(page?: number, pageSize?: number) {
    return this.accountEndpoint.getRolesEndpoint<Role[]>(page, pageSize);
  }

  getRolesAndPermissions(page?: number, pageSize?: number) {
    return forkJoin([
      this.accountEndpoint.getRolesEndpoint<Role[]>(page, pageSize),
      this.accountEndpoint.getPermissionsEndpoint<Permission[]>()]);
  }

  updateRole(role: Role) {
    if (role.id) {
      return this.accountEndpoint.getUpdateRoleEndpoint(role, role.id).pipe(
        tap(() => this.onRolesChanged([role], AccountService.roleModifiedOperation)));
    } else {
      return this.accountEndpoint.getRoleByRoleNameEndpoint<Role>(role.name).pipe(
        mergeMap(foundRole => {
          role.id = foundRole.id;
          return this.accountEndpoint.getUpdateRoleEndpoint(role, role.id);
        }),
        tap(() => this.onRolesChanged([role], AccountService.roleModifiedOperation)));
    }
  }

  newRole(role: Role) {
    return this.accountEndpoint.getNewRoleEndpoint<Role>(role).pipe<Role>(
      tap(() => this.onRolesChanged([role], AccountService.roleAddedOperation)));
  }

  deleteRole(roleOrRoleId: string | Role): Observable<Role> {
    if (typeof roleOrRoleId === 'string') {
      return this.accountEndpoint.getDeleteRoleEndpoint<Role>(roleOrRoleId as string).pipe<Role>(
        tap(data => this.onRolesChanged([data], AccountService.roleDeletedOperation)));
    } else {

      if (roleOrRoleId.id) {
        return this.deleteRole(roleOrRoleId.id);
      } else {
        return this.accountEndpoint.getRoleByRoleNameEndpoint<Role>(roleOrRoleId.name).pipe<Role>(
          mergeMap(role => this.deleteRole(role.id)));
      }
    }
  }

  getPermissions() {
    return this.accountEndpoint.getPermissionsEndpoint<Permission[]>();
  }

  private onRolesChanged(roles: Role[] | string[], op: RolesChangedOperation) {
    this.rolesChanged.next({ roles, operation: op });
  }

  onRolesUserCountChanged(roles: Role[] | string[]) {
    return this.onRolesChanged(roles, AccountService.roleModifiedOperation);
  }

  getRolesChangedEvent(): Observable<RolesChangedEventArg> {
    return this.rolesChanged.asObservable();
  }

  get permissions(): PermissionValues[] {
    return this.authService.userPermissions;
  }

  get currentUser() {
    return this.authService.currentUser;
  }
  get isAdmin(): boolean {
  const roles = this.authService.currentUser?.roles;
  if (!roles) {
    return false; // no roles defined
  }
  return roles.includes('admin');
}
get isUser(): boolean {
  const roles = this.authService.currentUser?.roles;
  if (!roles) {
    return false; // no roles defined
  }
  return roles.includes('user');
}
}
