import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatchFaceLogService, MatchFaceLogSummary } from '../../services/matchfacelog.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { SearchBoxComponent } from '../controls/search-box.component';
import { AuthService } from '../../services/auth.service';
import { AfterViewInit, ElementRef } from '@angular/core';
import Viewer from 'viewerjs';
@Component({
  selector: 'app-matchfacelog-summary',
  templateUrl: './matchfacelog-summary.component.html',
  styleUrls: ['./matchfacelog-summary.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, NgxDatatableModule, TranslateModule,SearchBoxComponent]
})
export class MatchFaceLogSummaryComponent implements OnInit {
  rows: MatchFaceLogSummary[] = [];
  rowsCache: MatchFaceLogSummary[] = [];
  loadingIndicator = true;
  searchTerm = '';
incidentLogs: any[] = [];
selectedSuspectName = '';
imageRotation: string = 'rotate(0deg)';
rotationAngle: number = 0;
@ViewChild('imageViewer', { static: true }) imageViewer!: TemplateRef<any>;
@ViewChild('viewerImage', { static: false }) viewerImage!: ElementRef;
viewerInstance: any;
suspectPhoto: string = '';
selectedCaptureDate: string = '';  // Store the capture date
isFullscreen: boolean = false; // Track fullscreen state
private authService = inject(AuthService);
selectedImageUrl: string = '';
rootImagePath = 'C:/Ketan/R&D/flask-backend-api/matched_faces'; // <-- Update this to your actual root path
isImageLoading = false;
isIncidentLoading =false;
@ViewChild('incidentModal') incidentModal!: TemplateRef<any>;
columns = [
  { name: 'Suspect ID', prop: 'suspectId' },
  { name: 'Suspect Name', prop: 'suspectName' },
  { name: 'Latest Capture', prop: 'latestCapture' },
  { name: 'Match Count', prop: 'matchCount' }
];

  constructor(private service: MatchFaceLogService, private modalService: NgbModal) {}
 dismissModal(modal: any) {
    // Close the modal
    modal.dismiss();
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.service.getSummary().subscribe({
      next: data => {
        this.rows = [...data];
        this.rowsCache = [...data];
        this.loadingIndicator = false;
      },
      error: err => {
        console.error('Failed to load match face log summary:', err);
        this.loadingIndicator = false;
        if(err?.error?.msg =="Token has expired")
        {
          this.authService.reLogin();
        }
      }
    });
  }
onRowActivate(event: any) {
  if (event.type === 'click') {
    const suspectId = event.row.suspectId;
    console.log('Clicked row suspect ID:', suspectId);
    // You can navigate, fetch details, etc.
  }
}
getFileNameWithoutExtension(filePath: string): string {
  const fileName = filePath.split('\\').pop() || filePath;
  return fileName.replace(/\.[^/.]+$/, ''); // removes the extension
}
closeImageViewer(modal: any): void {
  // modal.close();
   modal.dismiss();
  if (this.viewerInstance) {
    this.viewerInstance.destroy();
    this.viewerInstance = null;
  }
}
// openImage(log: any): void {
//   this.selectedImageUrl = `data:image/jpeg;base64,${log.frameBase64}`;
//   this.selectedCaptureDate = log.captureTime;  // Set capture date
//   // suspectPhoto already set from openIncidentPopup
//   this.modalService.open(this.imageViewer, { size: 'xl', centered: true });
// }


// openImage(log: any, imageViewerModal: any): void {
//   this.selectedImageUrl = `data:image/jpeg;base64,${log.frameBase64}`;
//   this.selectedCaptureDate = log.captureTime;  // Set capture date
//   const modalRef = this.modalService.open(imageViewerModal, { size: 'xl', centered: true });
   
// }

openImage(log: any, imageViewerModal: any): void {
  this.isImageLoading = true;
  this.selectedImageUrl = '';    // clear old image
  this.selectedCaptureDate = ''; // clear old date

  // open modal immediately
  const modalRef = this.modalService.open(imageViewerModal, { size: 'xl', centered: true });

  this.service.getLogById(log.id).subscribe({
    next: (data) => {
      this.selectedImageUrl = `data:image/jpeg;base64,${data.frameBase64}`;
      this.selectedCaptureDate = data.captureTime;
      this.isImageLoading = false;
    },
    error: (err) => {
      console.error('Failed to fetch log by ID:', err);
      this.isImageLoading = false;
      if (err?.error?.msg === 'Token has expired') {
        this.authService.reLogin();
      }
    }
  });
}



openViewerForImage(event: MouseEvent): void {
  const imgElement = event.target as HTMLImageElement;

  if (!imgElement || !(imgElement instanceof HTMLImageElement)) {
    console.warn('Clicked element is not an image');
    return;
  }

  if (this.viewerInstance) {
    this.viewerInstance.destroy();
  }

  this.viewerInstance = new Viewer(imgElement, {
    toolbar: true,
    navbar: true,
    title: true,
    scalable: true,
    zoomable: true,
    movable: true,
    fullscreen: true,
    viewed: () => {
      this.viewerInstance.zoomTo(1);
    }
  });

  this.viewerInstance.show();
}


openIncidentPopup(suspectId: number, suspectName: string, event: MouseEvent): void {
  event.preventDefault();  // prevent <a> default behavior
  this.selectedSuspectName = suspectName;

  this.isIncidentLoading = true; // start loader
  this.incidentLogs = [];        // clear old data
  this.suspectPhoto = '';

  this.modalService.open(this.incidentModal, { size: 'lg' }); // open modal immediately

  this.service.getIncidentsBySuspect(suspectId).subscribe({
    next: (data) => {
      this.incidentLogs = data.logs;
      this.suspectPhoto = data.suspectPhoto;
      this.isIncidentLoading = false; // stop loader
    },
    error: (err) => {
      console.error('Failed to load incidents:', err);
      this.isIncidentLoading = false;
      if (err?.error?.msg === 'Token has expired') {
        this.authService.reLogin();
      }
    }
  });
}

  onSearchChanged(searchValue: string): void {
    const term = searchValue.toLowerCase();
    this.rows = this.rowsCache.filter(r =>
      r.suspectName?.toLowerCase().includes(term) ||
      r.suspectId.toString().includes(term)
    );
  }
  toggleFullScreen() {
    this.isFullscreen = !this.isFullscreen; // Toggle fullscreen state
  const elem = document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
}

rotateImages() {
  this.rotationAngle = (this.rotationAngle + 90) % 360;
  this.imageRotation = `rotate(${this.rotationAngle}deg)`;
}

downloadImage(dataUrl: string, filename: string) {
  const a = document.createElement('a');
  a.href = dataUrl.startsWith('data:image') ? dataUrl : 'data:image/jpeg;base64,' + dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
}
