// ---------------------------------------
// Email: xyz@pqr.com
// Templates: /templates
// (c) 2024 /mit-license
// ---------------------------------------

import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Cctv } from '../../models/cctv.model'; // The interface for CCTV
import { CctvViewService } from '../../services/cctv-view.service';
import { OnDestroy, inject, input, viewChild } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FormsModule, NumberValueAccessor } from '@angular/forms';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../services/auth.service';
import { AlertService, MessageSeverity, DialogType } from '../../services/alert.service';
import { AppTranslationService } from '../../services/app-translation.service';
import { LocalStoreManager } from '../../services/local-store-manager.service';
import { Utilities } from '../../services/utilities';
import { SearchBoxComponent } from './search-box.component';
import { AutofocusDirective } from '../../directives/autofocus.directive';
import { TableColumn, NgxDatatableModule } from '@siemens/ngx-datatable';

@Component({
  selector: 'app-cctv-view',
  templateUrl: './cctv-view.component.html',
  styleUrls: ['./cctv-view.component.scss'],
  imports: [SearchBoxComponent, NgxDatatableModule, FormsModule, AutofocusDirective, NgbTooltip, NgClass, TranslateModule, CommonModule]
})
export class CctvViewComponent implements OnInit {
    @ViewChild('actionsTemplate', { static: true }) actionsTemplate!: TemplateRef<any>;
    cameraTypeOptions: string[] = ['Dome', 'Bullet', 'PTZ', 'Box', 'Fisheye'];
    hideField = true;
  columns: any[] = [
    { name: 'ID', prop: 'id' },
    { name: 'Name', prop: 'name' },
    { name: 'Location', prop: 'location' },
    { name: 'Description', prop: 'description' },
    { name: 'IP Address', prop: 'ipAddress' },
    { name: 'Latitude', prop: 'latitude' },
    { name: 'Longitude', prop: 'longitude' },
    { name: 'Altitude', prop: 'altitude' },
    { name: 'Camera Type', prop: 'cameraType' },
    { name: 'Camera Angle', prop: 'cameraAngle' },
    { name: 'Resolution', prop: 'resolution' },
    { name: 'Recording Status', prop: 'recordingStatus' },
    { name: 'Storage Duration Days', prop: 'storageDurationDays' },
    { name: 'Installation Date', prop: 'installationDate' },
    { name: 'Last Maintenance Date', prop: 'lastMaintenanceDate' },
    { name: 'Status', prop: 'status' },
    { name: 'Last Active Timestamp', prop: 'lastActiveTimestamp' },
    { name: 'Error Count', prop: 'errorCount' },
    { name: 'Auto Restart', prop: 'autoRestart' },
    { name: 'Is Critical', prop: 'isCritical' },
    { name: 'Face Crop Enabled', prop: 'faceCropEnabled' },
    { name: 'Frame Match Interval', prop: 'frameMatchInterval' },
    { name: 'Alert Group ID', prop: 'alertGroupId' },
    { name: 'Site ID', prop: 'siteId' },
    { name: 'Zone', prop: 'zone' },
    { name: 'Assigned Guard', prop: 'assignedGuard' },
    { name: 'Camera Model', prop: 'cameraModel' },
    { name: 'Video Download Location', prop: 'videoDownloadLocation' },
    { name: 'Stream URL', prop: 'streamUrl' },
    { name: 'Action', prop: 'action', cellTemplate: this.actionsTemplate }
  ];
  cctvEdit: Cctv = {} as Cctv;  // Object to hold CCTV data while adding or editing
  loadingIndicator: boolean = true;
  rows: Cctv[] = [];
  rowsCache: Cctv[] = [];
  readonly verticalScrollbar = input(false);
  @ViewChild('editorModal') editorModal!: TemplateRef<any>; // This line is required
  private modalRef: any;
  constructor(
    private modalService: NgbModal,
    private cctvService: CctvViewService // Service to interact with the backend API
  ) { }

  openEditor(row?: Cctv) {
    this.cctvEdit = row ? { ...row } : {} as Cctv;
  
    // Format dates if editing
    if (this.cctvEdit.installationDate) {
      this.cctvEdit.installationDate = this.formatDateForInput(this.cctvEdit.installationDate);
    }
    if (this.cctvEdit.lastMaintenanceDate) {
      this.cctvEdit.lastMaintenanceDate = this.formatDateForInput(this.cctvEdit.lastMaintenanceDate);
    }
  
    this.modalRef = this.modalService.open(this.editorModal, { size: 'lg' });
  }


  ngOnInit(): void {
    this.loadCctvs();
  }

  loadCctvs(): void {
    this.cctvService.getCctvs().subscribe(
      data => {
        this.rowsCache = [...data];  // Cache full data
        this.rows = [...data];       // Data to display
        this.loadingIndicator = false;
      },
      error => {
        console.error('Error loading CCTV data:', error);
        this.loadingIndicator = false;
      }
    );
  }

  onSearchChanged(value: string): void {
    const keyword = value.toLowerCase();
  
    this.rows = this.rowsCache.filter(r =>
      (r.name && r.name.toLowerCase().includes(keyword)) ||
      (r.streamUrl && r.streamUrl.toLowerCase().includes(keyword)) ||
      (r.location && r.location.toLowerCase().includes(keyword)) ||
      (r.ipAddress && r.ipAddress.toLowerCase().includes(keyword)) ||
      (r.cameraModel && r.cameraModel.toLowerCase().includes(keyword))
    );
  }

  showErrorAlert(caption: string, message: string) {
    //this.alertService.showMessage(caption, message, MessageSeverity.error);
  }

  // Method to open modal for adding new CCTV
  addCctv(): void {
    this.cctvEdit = {} as Cctv; // Reset form
   this.modalRef = this.modalService.open(this.editorModal, { size: 'lg' });
  }

  saveCctv(): void {
    if (this.cctvEdit.id) {
      this.cctvService.updateCctv(this.cctvEdit.id, this.cctvEdit).subscribe(
        () => {
          this.loadCctvs();
          if (this.modalRef) {
            this.modalRef.close();
          }
        },
        error => {
          console.error('Error updating CCTV:', error);
        }
      );
    } else {
      this.cctvService.createCctv(this.cctvEdit).subscribe(
        () => {
          this.loadCctvs();
          if (this.modalRef) {
            this.modalRef.close();
          }
        },
        error => {
          console.error('Error creating CCTV:', error);
        }
      );
    }
  }
  private formatDateForInput(date: string | Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }
  
  confirmDelete(modal: any): void {
    if (confirm(`Are you sure you want to delete CCTV "${this.cctvEdit.name}"?`)) {
      this.cctvService.deleteCctv(this.cctvEdit.id).subscribe(
        () => {
          modal.close(); // Close modal
          this.loadCctvs(); // Refresh the list
        },
        error => {
          console.error('Delete failed:', error);
        }
      );
    }
  }
  // Method to delete a CCTV
  deleteCctv(row: Cctv): void {
    if (confirm(`Are you sure you want to delete CCTV with ID: ${row.id}?`)) {
      this.cctvService.deleteCctv(row.id).subscribe(
        () => {
          this.loadCctvs();
        },
        error => {
          console.error('Error deleting CCTV:', error);
        }
      );
    }
  }

  // Method to open modal for editing a CCTV
//   editCctv(row: Cctv): void {
//     this.cctvEdit = { ...row }; // Copy the row data into the edit form
//     this.modalService.open(this.editorModal, { size: 'lg' });
//   }
editCctv(row: Cctv): void {
    this.openEditor(row); // reuse the same logic
  }
}
