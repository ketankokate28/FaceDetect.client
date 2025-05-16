import { Component, OnInit, OnDestroy, TemplateRef, inject, input, viewChild, ViewChild } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FormsModule, NumberValueAccessor } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NgbModal, NgbModalRef, NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { TableColumn, NgxDatatableModule } from '@siemens/ngx-datatable';

import { AuthService } from '../../services/auth.service';
import { AlertService, MessageSeverity, DialogType } from '../../services/alert.service';
import { AppTranslationService } from '../../services/app-translation.service';
import { LocalStoreManager } from '../../services/local-store-manager.service';
import { Utilities } from '../../services/utilities';
import { SearchBoxComponent } from './search-box.component';
import { AutofocusDirective } from '../../directives/autofocus.directive';
import { SuspectService } from '../../services/suspect.service'; // Import the service
import { Suspect } from '../../models/suspect.model';
import { ChangeDetectorRef } from '@angular/core';
@Component({
  selector: 'app-suspect-page',
  templateUrl: './suspect-page.component.html',
  styleUrls: ['./suspect-page.component.scss'],
  imports: [SearchBoxComponent, NgxDatatableModule, FormsModule,TranslateModule, CommonModule]
})
export class SuspectPageComponent implements OnInit {
  @ViewChild('actionsTemplate', { static: true }) actionsTemplate!: TemplateRef<any>;
  readonly verticalScrollbar = input(false);
  // Columns for the suspect data grid
  columns: any[] = [
    { name: 'ID', prop: 'id' },
    { name: 'Name', prop: 'name' },
    { name: 'FirstName', prop: 'firstName' },
    { name: 'LastName', prop: 'lastName' },
    { name: 'Age', prop: 'age' },
    { name: 'Gender', prop: 'gender' },
    { name: 'Height', prop: 'height' },
    { name: 'Weight', prop: 'weight' },
    { name: 'Face Description', prop: 'faceDescription' },
    { name: 'Biometric Data', prop: 'biometricData' },
    { name: 'Eye Color', prop: 'eyeColor' },
    { name: 'Hair Color', prop: 'hairColor' },
    { name: 'Facial Features', prop: 'facialFeatures' },
    { name: 'Scars or Marks', prop: 'scarsMarks' },
    { name: 'Tattoo Description', prop: 'tattooDescription' },
    { name: 'Nationality', prop: 'nationality' },

    { name: 'Shoulder Width (Cm)', prop: 'shoulderWidthCm' },
    { name: 'Torso Height (Cm)', prop: 'torsoHeightCm' },
    { name: 'Leg Length (Cm)', prop: 'legLengthCm' },
    { name: 'Shoe Size', prop: 'shoeSize' },
    { name: 'Assigned Officer', prop: 'aliases' },
    { name: 'Facial Image', prop: 'facialImage' },
    { name: 'file_blob_base64', prop: 'file_blob_base64' },
    { name: 'description', prop: 'description' },
    { name: 'Action', prop: 'action', cellTemplate: this.actionsTemplate }
  ];

  suspectEdit: Suspect = {} as Suspect;  // Object to hold Suspect data while adding or editing
  loadingIndicator: boolean = true;
  rows: Suspect[] = [];
  rowsCache: Suspect[] = [];
  @ViewChild('editorModal') editorModal!: TemplateRef<any>; // This line is required
  private modalRef: NgbModalRef | any;
  previewImage: string | null = null;
  @ViewChild('imagePreviewModal') imagePreviewModal: any;
  private authService = inject(AuthService);
  constructor(
    private modalService: NgbModal,
    private suspectService: SuspectService, // Service to interact with the backend API
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadSuspects();
  }

  // Load all suspects data from backend
  loadSuspects(): void {
    this.suspectService.getSuspects().subscribe(
      data => {
        this.rowsCache = [...data];  // Cache full data
        this.rows = [...data];       // Data to display
        this.loadingIndicator = false;
      },
      error => {
        console.error('Error loading Suspect data:', error);
        this.loadingIndicator = false;
        if(error?.error?.msg =="Token has expired")
        {
          this.authService.reLogin();
        }
      }
    );
  }

  // Filter rows based on search input
  onSearchChanged(value: string): void {
    const keyword = value.toLowerCase();
  
    this.rows = this.rowsCache.filter(r =>
      (r.firstName && r.firstName.toLowerCase().includes(keyword)) ||
      (r.nationality && r.nationality.toLowerCase().includes(keyword)) ||
      (r.lastName && r.lastName.toLowerCase().includes(keyword))
    );
  }

  // Open modal for adding or editing Suspect
  openEditor(row?: Suspect) {
    this.suspectEdit = row ? { ...row } : {} as Suspect;
  this.modalRef = this.modalService.open(this.editorModal, { size: 'lg' });
  if (row?.file_blob_base64) {
    this.previewImage = `data:image/jpeg;base64,${row?.file_blob_base64}`;
  } else {
    this.previewImage = null; // Ensure no image if not available
  }
  }

  // Method to handle file image upload
  handleImageUpload(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.suspectEdit.image = file;
  
      const reader = new FileReader();
      reader.onload = () => {
        this.previewImage = reader.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      // If no file is selected, reset the previewImage and suspectEdit.image
      this.previewImage = null;
      this.suspectEdit.image = undefined;
    }
  }
 // Method to open modal for adding new CCTV
  addSuspect(): void {
    this.suspectEdit = {} as Suspect; // Reset form
    //this.modalService.open(this.editorModal, { size: 'lg' });
    this.previewImage = null; // Ensure that no previous image is shown
    this.modalRef = this.modalService.open(this.editorModal, { size: 'lg' });
  }

  saveSuspect(): void {
    
    if (!this.suspectEdit.firstName) {
      // If any of the fields are empty, show an alert or error message
      alert("Both Suspect Name is required.");
      return; // Prevent further execution if fields are missing
    }
    else if (this.selectedFile)
    {
      this.suspectEdit.image =this.selectedFile;
    }

    const request$ = this.suspectEdit.id
      ? this.suspectService.updateSuspect(this.suspectEdit.id, this.suspectEdit)
      : this.suspectService.addSuspect(this.suspectEdit);
  
    request$.subscribe(
      () => {
        this.loadSuspects();
        if (this.modalRef) {
          this.modalRef.close();
        }
      },
      error => {
        console.error('Error saving suspect:', error);
        if(error?.error?.msg =="Token has expired")
        {
          this.authService.reLogin();
        }
      }
    );
  }
    // Method to edit a suspect when the "Edit" button is clicked
    editSuspect(suspect: Suspect) {
      this.openEditor(suspect); // Open the modal with the suspect details for editing
    }
  
  deleteSuspect(row: Suspect): void {
    if (row.id === undefined) {
      console.error('Cannot delete suspect: ID is undefined');
      return;
    }
  
    if (confirm(`Are you sure you want to delete Suspect with ID: ${row.id}?`)) {
      this.suspectService.deleteSuspect(row.id).subscribe(
        () => {
          this.loadSuspects();
        },
        error => {
          console.error('Error deleting Suspect:', error);
          if(error.error.msg =="Token has expired")
        {
          this.authService.reLogin();
        }
        }
      );
    }
  }
  selectedFile: File | null = null;

  // onFileSelected(event: Event): void {
  //   const input = event.target as HTMLInputElement;
  //   if (input.files && input.files.length > 0) {
  //     this.selectedFile = input.files[0];
  //   }
  // }
  onFileSelected(event: any) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
    const file: File = event.target.files[0];
    if (file) {
      this.suspectEdit.image = file;
  
      const reader = new FileReader();
      reader.onload = () => {
        this.previewImage = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
  openImagePreview() {
    this.modalService.open(this.imagePreviewModal, { size: 'lg' });
  }
  viewImage(base64Data: string): void {
    this.previewImage = `data:image/jpeg;base64,${base64Data}`;
    
    // Force Angular to detect the change before opening modal
    this.cdRef.detectChanges();
  
    this.modalService.open(this.imagePreviewModal, { size: 'lg' });
  }
  
  confirmDelete(modal: any): void {
    // Check if id is undefined before proceeding
    if (this.suspectEdit.id === undefined) {
      console.error('Suspect ID is undefined, cannot delete');
      return;
    }
  
    if (confirm(`Are you sure you want to delete Suspect "${this.suspectEdit.firstName}"?`)) {
      this.suspectService.deleteSuspect(this.suspectEdit.id).subscribe(
        () => {
          modal.close(); // Close modal
          this.loadSuspects(); // Refresh the list
        },
        error => {
          console.error('Delete failed:', error);
          if(error?.error?.msg =="Token has expired")
        {
          this.authService.reLogin();
        }
        }
      );
    }
  }
  
}
