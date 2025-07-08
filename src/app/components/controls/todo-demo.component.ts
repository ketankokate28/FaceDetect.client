// ---------------------------------------
// Email: xyz@pqr.com
// Templates: /templates
// (c) 2024 /mit-license
// ---------------------------------------

import { Component, OnInit, OnDestroy, TemplateRef, inject, input, viewChild } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule, NumberValueAccessor } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NgbModal, NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { TableColumn, NgxDatatableModule } from '@siemens/ngx-datatable';

import { AuthService } from '../../services/auth.service';
import { AlertService, MessageSeverity, DialogType } from '../../services/alert.service';
import { AppTranslationService } from '../../services/app-translation.service';
import { LocalStoreManager } from '../../services/local-store-manager.service';
import { Utilities } from '../../services/utilities';
import { SearchBoxComponent } from './search-box.component';
import { AutofocusDirective } from '../../directives/autofocus.directive';
import { CctvService } from '../../services/cctv.service'; // Import the service

interface Todo {
  $$index?: number;
  completed: boolean;
  important: boolean;
  name: string;
  streamUrl: string;
  id: number;
}

@Component({
  selector: 'app-todo-demo',
  templateUrl: './todo-demo.component.html',
  styleUrl: './todo-demo.component.scss',
  imports: [SearchBoxComponent, NgxDatatableModule, FormsModule, AutofocusDirective, NgbTooltip, NgClass, TranslateModule]
})
export class TodoDemoComponent implements OnInit, OnDestroy {
  constructor(private cctvService: CctvService) { }
  private alertService = inject(AlertService);
  private translationService = inject(AppTranslationService);
  private localStorage = inject(LocalStoreManager);
  private authService = inject(AuthService);
  private modalService = inject(NgbModal);

  public static readonly DBKeyTodoDemo = 'todo-demo.todo_list';

  columns: TableColumn[] = [];
  rows: Todo[] = [];
  rowsCache: Todo[] = [];
  editing: Record<string, boolean> = {};
  taskEdit: Partial<Todo> = {};
  isDataLoaded = false;
  loadingIndicator = true;
  formResetToggle = true;
  private _currentUserId: string | undefined;
  private _hideCompletedTasks = false;

  get currentUserId() {
    if (this.authService.currentUser) {
      this._currentUserId = this.authService.currentUser.id;
    }

    return this._currentUserId;
  }

  set hideCompletedTasks(value: boolean) {
    if (value) {
      this.rows = this.rowsCache.filter(r => !r.completed);
    } else {
      this.rows = [...this.rowsCache];
    }

    this._hideCompletedTasks = value;
  }
  get hideCompletedTasks() {
    return this._hideCompletedTasks;
  }

  readonly verticalScrollbar = input(false);

  readonly statusHeaderTemplate = viewChild.required<TemplateRef<unknown>>('statusHeaderTemplate');

  readonly statusTemplate = viewChild.required<TemplateRef<unknown>>('statusTemplate');

  readonly nameTemplate = viewChild.required<TemplateRef<unknown>>('nameTemplate');

  readonly descriptionTemplate = viewChild.required<TemplateRef<unknown>>('descriptionTemplate');

  readonly actionsTemplate = viewChild.required<TemplateRef<unknown>>('actionsTemplate');

  readonly editorModalTemplate = viewChild.required<TemplateRef<unknown>>('editorModal');

  ngOnInit() {
    this.loadingIndicator = true;

    this.fetch(data => {
      this.refreshDataIndexes(data);
      this.rows = data;
      this.rowsCache = [...data];
      this.isDataLoaded = true;

      setTimeout(() => { this.loadingIndicator = false; }, 1500);
    });

    const gT = (key: string) => this.translationService.getTranslation(key);

    this.columns = [
      {
        prop: 'completed',
        name: '',
        width: 30,
        headerTemplate: this.statusHeaderTemplate(),
        cellTemplate: this.statusTemplate(),
        resizeable: false,
        canAutoResize: false,
        sortable: false,
        draggable: false
      },
      {
        prop: 'name',
        name: gT('todoDemo.management.Task'),
        width: 100,
        cellTemplate: this.nameTemplate()
      },
      {
        prop: 'streamUrl',
        name: gT('todoDemo.management.Description'),
        width: 300,
        cellTemplate: this.descriptionTemplate()
      },
      {
        name: '',
        width: 80,
        cellTemplate: this.actionsTemplate(),
        resizeable: false,
        canAutoResize: false,
        sortable: false,
        draggable: false
      }
    ];
  }

  ngOnDestroy() {
    this.saveToDisk();
  }

  fetch(callback: (data: Todo[]) => void) {
     // Call the API through your CctvService
     this.cctvService.getCctvs(undefined).subscribe({
      next: (response) => {
        const data = response;  // Assuming the response is an array of Todos
        callback(data);
      },
      error: (err) => {
        console.error('Error fetching data from API:', err);
        this.loadingIndicator = false;
      }
    });
  }

  fetch_backup(callback: (data: Todo[]) => void) {
    let data = this.getFromDisk();

    if (data == null) {
      setTimeout(() => {
        data = this.getFromDisk();

        if (data == null) {
          data = [
            {
              completed: true,
              important: true,
              name: 'CCTV_1',
              streamUrl: 'CCTV_1 is installed in Palghar Police station sector 2',
              id:1
            },
            {
              completed: false,
              important: true,
              name: 'CCTV_2',
              streamUrl: 'CCTV_2 is installed in Palghar Police station sector 3',
              id:2
            },
            {
              completed: false,
              important: false,
              name: 'CCTV_3',
              streamUrl: 'CCTV_3 is installed in Palghar Police station sector 4',
              id:3
            },
          ];
        }

        callback(data);
      }, 1000);
    } else {
      callback(data);
    }
  }

  refreshDataIndexes(data: Todo[]) {
    let index = 0;

    for (const i of data) {
      i.$$index = index++;
    }
  }

  onSearchChanged(value: string) {
    this.rows = this.rowsCache.filter(r =>
      Utilities.searchArray(value, false, r.name, r.streamUrl) ||
      value === 'important' && r.important ||
      value === 'not important' && !r.important);
  }

  showErrorAlert(caption: string, message: string) {
    this.alertService.showMessage(caption, message, MessageSeverity.error);
  }

  addTask() {
    this.formResetToggle = false;

    setTimeout(() => {
      this.formResetToggle = true;

      this.taskEdit = {};
      this.modalService.open(this.editorModalTemplate());
    });
  }

  save() {
    this.rowsCache.splice(0, 0, this.taskEdit as Todo);
    this.rows.splice(0, 0, this.taskEdit as Todo);
    this.refreshDataIndexes(this.rowsCache);
    this.rows = [...this.rows];
    this.addCctv(this.taskEdit.name!, this.taskEdit.streamUrl!);
    this.saveToDisk();
    return true;
  }

   // Method to add a new CCTV
   addCctv(name1: string, streamUrl1: string) {
    const newCctv = {
      name: name1,
      streamUrl: streamUrl1
    };

    // Call the service to add CCTV
    this.cctvService.addCctv(newCctv).subscribe({
      next: (response) => {
        console.log('CCTV added successfully', response);
      },
      error: (err) => {
        console.error('Error adding CCTV:', err);
      }
    });
  }

  updateValue_bkp(event: Event, cell: 'name' | 'streamUrl', row: Todo) {
    this.editing[row.$$index + '-' + cell] = false;
    row[cell] = (event.target as HTMLInputElement).value;
    this.rows = [...this.rows];

    this.saveToDisk();
  }

  updateValue(event: Event, cell: 'name' | 'streamUrl', row: Todo) {
    this.editing[row.$$index + '-' + cell] = false;
    
    // Update the value locally
    row[cell] = (event.target as HTMLInputElement).value;
    this.rows = [...this.rows];
  
    // Now call the update API to persist the changes
    this.cctvService.updateCctv(row.id!, row.name, row.streamUrl).subscribe({
      next: (response) => {
        console.log('CCTV updated successfully:', response);
        // Optionally, handle success (e.g., show a success message)
      },
      error: (err) => {
        console.error('Error updating CCTV:', err);
        // Optionally, handle error (e.g., show an error message)
      }
    });
  }

  delete(row: Todo) {
    this.alertService.showDialog('Are you sure you want to delete the CCTV?', DialogType.confirm, () => this.deleteHelper(row));
  }

  deleteHelper_bkp(row: Todo) {
    this.rowsCache = this.rowsCache.filter(item => item !== row);
    this.rows = this.rows.filter(item => item !== row);

    this.saveToDisk();
  }

  deleteHelper(row: Todo) {
    // Call the delete API to remove the CCTV from the backend
    this.cctvService.deleteCctv(row.id!).subscribe({
      next: (response) => {
        console.log('CCTV deleted successfully:', response);
        
        // Remove the CCTV record from the local rows and rowsCache
        this.rowsCache = this.rowsCache.filter(item => item !== row);
        this.rows = this.rows.filter(item => item !== row);
  
        // Optionally show success message (e.g., using alertService)
        this.alertService.showMessage('Success', 'CCTV record deleted successfully', MessageSeverity.success);

      },
      error: (err) => {
        console.error('Error deleting CCTV:', err);
        // Optionally, show an error message if the delete failed
        this.alertService.showMessage('Error', 'Failed to delete CCTV record', MessageSeverity.error);
      }
    });
  }
  getFromDisk() {
    return this.localStorage.getDataObject<Todo[]>(`${TodoDemoComponent.DBKeyTodoDemo}:${this.currentUserId}`);
  }

  saveToDisk() {
    if (this.isDataLoaded) {
      this.localStorage.saveSyncedSessionData(this.rowsCache, `${TodoDemoComponent.DBKeyTodoDemo}:${this.currentUserId}`);
    }
  }
}
