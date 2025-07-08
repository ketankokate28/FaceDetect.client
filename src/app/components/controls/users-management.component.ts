import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { AlertService, DialogType, MessageSeverity } from '../../services/alert.service';
import { AppTranslationService } from '../../services/app-translation.service';
import { AccountService } from '../../services/account.service';
import { Utilities } from '../../services/utilities';
import { User } from '../../models/user.model';
import { Role } from '../../models/role.model';
import { Permissions } from '../../models/permission.model';
import { UserEdit } from '../../models/user-edit.model';
import { UserInfoComponent } from './user-info.component';
import { SearchBoxComponent } from './search-box.component';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-users-management',
  templateUrl: './users-management.component.html',
  styleUrls: ['./users-management.component.scss'],
  standalone: true,
  imports: [
    SearchBoxComponent,
    NgxDatatableModule,
    UserInfoComponent,           // ✅ Add this line
    TranslateModule,
    CommonModule
  ]
})
export class UsersManagementComponent implements OnInit {
  constructor(
    private alertService: AlertService,
    private translationService: AppTranslationService,
    private accountService: AccountService,
    private modalService: NgbModal
  ) {}

  columns: any[] = [];
  rows: User[] = [];
  rowsCache: User[] = [];
  editedUser: UserEdit | null = null;
  sourceUser: UserEdit | null = null;
  editingUserName: { name: string } | null = null;
  loadingIndicator = false;
  allRoles: Role[] = [];

  @ViewChild('indexTemplate', { static: true }) indexTemplate!: TemplateRef<any>;
  @ViewChild('userNameTemplate', { static: true }) userNameTemplate!: TemplateRef<any>;
  @ViewChild('rolesTemplate', { static: true }) rolesTemplate!: TemplateRef<any>;
  @ViewChild('actionsTemplate', { static: true }) actionsTemplate!: TemplateRef<any>;
  @ViewChild('editorModal', { static: true }) editorModalTemplate!: TemplateRef<any>;
  @ViewChild(UserInfoComponent) userEditor!: UserInfoComponent;

  ngOnInit(): void {
    const gT = (key: string) => this.translationService.getTranslation(key);

    this.columns = [
      { prop: 'index', name: '#', width: 40, cellTemplate: this.indexTemplate, canAutoResize: false },
      { prop: 'jobTitle', name: gT('users.management.Title'), width: 50 },
      { prop: 'userName', name: gT('users.management.UserName'), width: 90, cellTemplate: this.userNameTemplate },
      { prop: 'fullName', name: gT('users.management.FullName'), width: 120 },
      { prop: 'email', name: gT('users.management.Email'), width: 140 },
      { prop: 'roles', name: gT('users.management.Roles'), width: 120, cellTemplate: this.rolesTemplate },
      { prop: 'phoneNumber', name: gT('users.management.PhoneNumber'), width: 100 },
      {
        name: '',
        width: 160,
        cellTemplate: this.actionsTemplate,
        resizeable: false,
        canAutoResize: false,
        sortable: false,
        draggable: false
      }
    ];

    this.loadData();
  }

  loadData() {
    this.alertService.startLoadingMessage();
    this.loadingIndicator = true;

    this.accountService.getUsersAndRoles().subscribe({
      next: results => this.onDataLoadSuccessful(results[0], results[1]),
      error: error => this.onDataLoadFailed(error)
    });
  }
  onSearchChanged(searchTerm: string) {
    this.rows = this.rowsCache.filter(r =>
      Utilities.searchArray(searchTerm, false, r.userName, r.fullName, r.email, r.phoneNumber, r.jobTitle, r.roles));
  }
  onDataLoadSuccessful(users: User[], roles: Role[]) {
    this.alertService.stopLoadingMessage();
    this.loadingIndicator = false;
  
    users.forEach((user, index) => {
      (user as UserIndex).index = index + 1;
  
      // Make sure roles is always an array
      if (!Array.isArray(user.roles)) {
        user.roles = [];
      }
    });
  
    this.rowsCache = [...users];
    this.rows = users;
  
    this.allRoles = roles;
  }
  

  onDataLoadFailed(error: HttpErrorResponse) {
    this.alertService.stopLoadingMessage();
    this.loadingIndicator = false;

    this.alertService.showStickyMessage(
      'Load Error',
      `Unable to retrieve users from the server.\r\nError: "${Utilities.getHttpResponseMessage(error)}"`,
      MessageSeverity.error,
      error
    );
  }

  newUser() {
    this.editingUserName = null;
    this.sourceUser = null;
    this.openUserEditor();
  }

  editUser(row: UserEdit) {
    this.editingUserName = { name: row.userName };
    this.sourceUser = row;
    this.openUserEditor();
  }
  processRoles(value: any): string[] {
    return Array.isArray(value) ? value : [];
  }
  openUserEditor() {
    const modalRef: NgbModalRef = this.modalService.open(this.editorModalTemplate, {
      size: 'lg',
      backdrop: 'static'
    });

    setTimeout(() => {
      if (!this.userEditor) return;

      if (this.sourceUser == null) {
        this.editedUser = this.userEditor.newUser(this.allRoles);
      } else {
        this.editedUser = this.userEditor.editUser(this.sourceUser, this.allRoles);
      }

      this.userEditor.changesSavedCallback = () => {
        this.addNewUserToList();
        modalRef.close();
      };

      this.userEditor.changesCancelledCallback = () => {
        this.editedUser = null;
        this.sourceUser = null;
        modalRef.close();
      };
    });
  }

  addNewUserToList() {
    if (!this.editedUser) return;
  
    const user = new User();
    Object.assign(user, this.editedUser);
  
    if (this.sourceUser) {
      // Update existing user
      const index = this.rowsCache.findIndex(u => u.id === this.sourceUser?.id);
      if (index !== -1) {
        this.rowsCache[index] = user; // Update the user in cache
        this.rows[index] = user; // Update the user in the table rows
      }
    } else {
      // Add new user
      this.rowsCache.unshift(user);
      this.rows.unshift(user);
    }
  
    this.rows = [...this.rows]; // Trigger a table update
    this.editedUser = null;
    this.sourceUser = null;
  }
  

  deleteUser(row: UserEdit) {
    this.alertService.showDialog(
      `Are you sure you want to delete "${row.userName}"?`,
      DialogType.confirm,
      () => this.deleteUserHelper(row)
    );
  }

  deleteUserHelper(row: UserEdit) {
    this.alertService.startLoadingMessage('Deleting...');
    this.loadingIndicator = true;

    this.accountService.deleteUser(row).subscribe({
      next: () => {
        this.alertService.stopLoadingMessage();
        this.loadingIndicator = false;

        this.rowsCache = this.rowsCache.filter(item => item !== row);
        this.rows = this.rows.filter(item => item !== row);
      },
      error: error => {
        this.alertService.stopLoadingMessage();
        this.loadingIndicator = false;

        this.alertService.showStickyMessage(
          'Delete Error',
          `An error occurred whilst deleting the user.\r\nError: "${Utilities.getHttpResponseMessage(error)}"`,
          MessageSeverity.error,
          error
        );
      }
    });
  }

  get canManageUsers() {
    return this.accountService.isAdmin;
    //return this.accountService.userHasPermission(Permissions.manageUsers);
  }

  get canAssignRoles() {
    return this.accountService.isAdmin;
    //return this.accountService.userHasPermission(Permissions.assignRoles);
  }

  get canViewRoles() {
    return this.accountService.isAdmin ||  this.accountService.isUser;;
    //return this.accountService.userHasPermission(Permissions.viewRoles);
  }
}
interface UserIndex extends User {
  index: number;
}