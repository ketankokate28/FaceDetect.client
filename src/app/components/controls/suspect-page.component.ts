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
import { Subnode,Node, Tenant } from '../../models/hierarchy.model';
import { HierarchyService } from '../../services/hierarchy.service';
import { AccountService } from '../../services/account.service';
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
    { name: 'Distribution To', prop: 'distributionto' },
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
  imageFiles: { [key: number]: File } = {};
    imagePreviewUrl: string = '';
uploadedImages: { [key: number]: string | Blob } = {};
modalImageUrl: string | null = null;
showImageModal: boolean = false;

tenants: Tenant[] = [];
nodes: Node[] = [];
subnodes: Subnode[] = [];
selectedTenantId: number = 0;
selectedNodeId: number = 0;
disableHierarchy: boolean = false;

//Hide below fields 
hideField = true;

  @ViewChild('imagePreviewModal') imagePreviewModal: any;
  private authService = inject(AuthService);
  constructor(
    private modalService: NgbModal,
    private suspectService: SuspectService, // Service to interact with the backend API
    private cdRef: ChangeDetectorRef,
    private hierarchyService: HierarchyService,
    private accountService: AccountService
  ) { }

  ngOnInit(): void {
  this.loadSuspects();

   const userSubnodeId = this.accountService.currentUser?.subnodeId;

  if (userSubnodeId && userSubnodeId > 0) {
    this.disableHierarchy = true;
  }

  this.loadHierarchy().then(() => {
    if (this.disableHierarchy && userSubnodeId) {
      this.preselectHierarchy(userSubnodeId);
    } else if (this.suspectEdit.subnode_id) {
      this.preselectHierarchy(this.suspectEdit.subnode_id);
    }
  });
}


loadHierarchy(): Promise<void> {
  return new Promise(resolve => {
    this.hierarchyService.getHierarchy().subscribe(data => {
      this.tenants = data;
      resolve();
      this.cdRef.detectChanges();
    });
  });
}

preselectHierarchy(subnodeId: number): boolean {
  for (const tenant of this.tenants) {
    for (const node of tenant.nodes) {
      for (const subnode of node.subnodes) {
        if (subnode.id === subnodeId) {
          this.selectedTenantId = tenant.id;
          this.nodes = tenant.nodes;
          this.selectedNodeId = node.id;
          this.subnodes = node.subnodes;
          this.suspectEdit.subnode_id = subnodeId;
          return true;
        }
      }
    }
  }

  this.selectedTenantId = 0;
  this.selectedNodeId = 0;
  this.subnodes = [];
  return false;
}



onTenantChange() {
  const tenant = this.tenants.find(t => t.id === +this.selectedTenantId);
  this.nodes = tenant ? tenant.nodes : [];
  this.selectedNodeId = 0;
  this.subnodes = [];
  this.suspectEdit.subnode_id = 0;
}

onNodeChange() {
  const node = this.nodes.find(n => n.id === +this.selectedNodeId);
  this.subnodes = node ? node.subnodes : [];
  this.suspectEdit.subnode_id = 0;
}
  // Load all suspects data from backend
loadSuspects(): void {
  const subnodeId = this.accountService.currentUser?.subnodeId || 0;

  this.suspectService.getSuspects(subnodeId).subscribe(
    data => {
      this.rowsCache = [...data];  // Cache full data
      this.rows = [...data];       // Data to display
      this.loadingIndicator = false;
    },
    error => {
      console.error('Error loading Suspect data:', error);
      this.loadingIndicator = false;
      if (error?.error?.msg === "Token has expired") {
        this.authService.reLogin();
      }
    }
  );
}

handleMultiImageUpload(event: any, index: number): void {
  const file = event.target.files[0];
  if (file) {
    this.imageFiles[index] = file;
    if (index === 1) {
      const reader = new FileReader();
      reader.onload = () => {
        this.previewImage = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
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

  if (!row) {
    this.selectedTenantId = 0;
    this.selectedNodeId = 0;
    this.subnodes = [];
  }

  const loggedInSubnodeId = this.accountService.currentUser?.subnodeId ?? 0;
  let targetSubnodeId = 0;

  if (row?.subnode_id && row.subnode_id > 0) {
    targetSubnodeId = row.subnode_id;
  } else if (loggedInSubnodeId > 0) {
    targetSubnodeId = loggedInSubnodeId;
  }

  this.loadHierarchy().then(() => {
    if (targetSubnodeId > 0) {
      const found = this.preselectHierarchy(targetSubnodeId);
      if (found) {
        // ✅ If the logged-in user is Admin (subnodeId = 0), keep dropdown enabled
        this.disableHierarchy = loggedInSubnodeId > 0;
      } else {
        this.disableHierarchy = false; // invalid id → leave enabled
      }
    } else {
      this.disableHierarchy = false;   // no subnode id anywhere → leave enabled
    }
  });

  this.modalRef = this.modalService.open(this.editorModal, { size: 'lg' });

  if (row?.file_blob_base64) {
    this.previewImage = `data:image/jpeg;base64,${row.file_blob_base64}`;
  } else {
    this.previewImage = null;
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
    this.suspectEdit.distributionto = 'P';
    //this.modalService.open(this.editorModal, { size: 'lg' });
    this.previewImage = null; // Ensure that no previous image is shown
    this.imageFiles = {};
  this.uploadedImages = {}; // Clear any existing uploaded images
    this.showImageModal = false;
  this.modalImageUrl = null;

    const userSubnodeId = this.accountService.currentUser?.subnodeId;

  if (userSubnodeId && userSubnodeId > 0) {
    this.disableHierarchy = true;
    this.preselectHierarchy(userSubnodeId);
  } else {
    this.disableHierarchy = false;
    this.selectedTenantId = 0;
    this.selectedNodeId = 0;
    this.subnodes = [];
  }


    this.modalRef = this.modalService.open(this.editorModal, { size: 'lg' });
  }
onSubnodeChange(id: number) {
  if (!this.disableHierarchy) {
    this.suspectEdit.subnode_id = id;
  }
}
  saveSuspect(): void {
    
    // if (!this.suspectEdit.firstName) {
    //   // If any of the fields are empty, show an alert or error message
    //   alert("Both Suspect Name is required.");
    //   return; // Prevent further execution if fields are missing
    // }
    // else if (this.selectedFile)
    // {
    //   this.suspectEdit.image =this.selectedFile;
    // }
 if (!this.suspectEdit.firstName) {
    alert("First Name is required.");
    return;
  }


   let targetSubnodeId = this.suspectEdit.subnode_id ?? 0;

  if (!targetSubnodeId) {
    // Try to pick from selected subnodes
    const selected = this.subnodes.find(s => s.id === this.suspectEdit.subnode_id);
    if (selected) {
      targetSubnodeId = selected.id;
    }
  }

  if (!targetSubnodeId && this.disableHierarchy) {
    // fallback to logged-in user’s subnode
    targetSubnodeId = this.accountService.currentUser?.subnodeId ?? 0;
  }

  this.suspectEdit.subnode_id = targetSubnodeId || undefined;
  // if (!this.imageFiles[1]) {
  //   alert("Image 1 is required.");
  //   return;
  // }
    const request$ = this.suspectEdit.id
      ? this.suspectService.updateSuspect(this.suspectEdit.id, this.suspectEdit)
      : this.suspectService.addSuspect(this.suspectEdit);
  
request$.subscribe(
    (response: any) => {
      const suspectId = this.suspectEdit.id || response?.id;
      if (suspectId) {
        const hasImages = Object.values(this.imageFiles).some(file => !!file);
        if (hasImages) {
          this.uploadImages(suspectId);
        } else {
          this.loadSuspects();
          this.modalRef?.close(); // ✅ Close if no images
        }
      }
    },
    error => {
      console.error('Error saving suspect:', error);
      if (error?.error?.msg === "Token has expired") {
        this.authService.reLogin();
      }
    }
  );
  }

uploadImages(suspectId: number): void {
  const formData = new FormData();
  let hasImage = false;
  for (let i = 1; i <= 5; i++) {
    if (this.imageFiles[i]) {
      formData.append(`image${i}`, this.imageFiles[i]);
      hasImage = true;
    }
  }
if (!hasImage) {
    console.log('No images to upload, skipping API call.');
    return; // ✅ Don't call the API if no images were added
  }
  this.suspectService.uploadSuspectImages(suspectId, formData).subscribe(
    () => {
      this.loadSuspects();
      this.modalRef?.close();
    },
    error => {
      console.error('Image upload failed:', error);
      if (error?.error?.msg === "Token has expired") {
        this.authService.reLogin();
      }
    }
  );
}


    // Method to edit a suspect when the "Edit" button is clicked
   editSuspect(suspect: Suspect) {
  this.imageFiles = {}; // Clear any existing file data
  this.uploadedImages = {}; // Clear any existing uploaded images

  // Fetch the suspect details using the service
  this.suspectService.getSuspectById(Number(suspect.id)).subscribe(response => {
    // If the response contains base64, assign it to uploadedImages
    this.uploadedImages = {
      1: response.file_blob1 || (response.file_path1 ? this.convertToBase64(response.file_blob1) : null),
      2: response.file_blob2 || (response.file_path2 ? this.convertToBase64(response.file_blob2) : null),
      3: response.file_blob3 || (response.file_path3 ? this.convertToBase64(response.file_blob3) : null),
      4: response.file_blob4 || (response.file_path4 ? this.convertToBase64(response.file_blob4) : null),
      5: response.file_blob5 || (response.file_path5 ? this.convertToBase64(response.file_blob5) : null)
    };
  this.showImageModal = false;
  this.modalImageUrl = null;
    // Open the editor with the suspect details
    this.openEditor(suspect); // Open the modal with the suspect details for editing
  });
}
  convertToBase64(filePath: string): string {
  // This method needs to implement logic for converting file paths to base64
  // If you are working with server-side images, you will need a service to fetch the image and convert it
  // Example implementation (this will depend on your environment)
  return `data:image/jpeg;base64,${filePath}`; // Placeholder, update with actual conversion logic
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

showImagePreview(event: Event, index: number) {
  // Prevent the page refresh
  event.preventDefault();

  const imageBlob = this.uploadedImages[index];  // Retrieve the image (Blob or Base64 string)
  let imageUrl: string = '';  // Initialize imageUrl

  // If the imageBlob is a Base64 string or Blob, handle accordingly
  if (typeof imageBlob === 'string') {
    // If it's already a Base64 string, use it directly
    imageUrl = imageBlob;
  } else if (imageBlob instanceof Blob) {
    // If it's a Blob, create an object URL
    imageUrl = URL.createObjectURL(imageBlob);
  }

  // Pass imageUrl to the modal for preview
  this.showImageInModal(imageUrl);  // Show the image in the modal
}

showImageInModal(imageBase64: string) {
  this.modalImageUrl = `data:image/jpeg;base64,${imageBase64}`;
  this.showImageModal = true; // Show the modal
}

closeModal() {
  this.showImageModal = false;
  this.modalImageUrl = null;
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
