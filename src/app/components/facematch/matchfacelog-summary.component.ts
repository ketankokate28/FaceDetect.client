import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatchFaceLogService, MatchFaceLogSummary } from '../../services/matchfacelog.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@siemens/ngx-datatable';

@Component({
  selector: 'app-matchfacelog-summary',
  templateUrl: './matchfacelog-summary.component.html',
  styleUrls: ['./matchfacelog-summary.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, NgxDatatableModule, TranslateModule]
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
suspectPhoto: string = '';
selectedCaptureDate: string = '';  // Store the capture date
isFullscreen: boolean = false; // Track fullscreen state

selectedImageUrl: string = '';
rootImagePath = 'C:/Ketan/R&D/flask-backend-api/matched_faces'; // <-- Update this to your actual root path

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

closeImageViewer(modal: any): void {
  modal.close();
}
// openImage(log: any): void {
//   this.selectedImageUrl = `data:image/jpeg;base64,${log.frameBase64}`;
//   this.selectedCaptureDate = log.captureTime;  // Set capture date
//   // suspectPhoto already set from openIncidentPopup
//   this.modalService.open(this.imageViewer, { size: 'xl', centered: true });
// }
openImage(log: any, imageViewerModal: any): void {
  this.selectedImageUrl = `data:image/jpeg;base64,${log.frameBase64}`;
  this.selectedCaptureDate = log.captureTime;  // Set capture date
  this.modalService.open(imageViewerModal, { size: 'xl', centered: true });
}

openIncidentPopup(suspectId: number, suspectName: string, event: MouseEvent): void {
  event.preventDefault();  // prevent <a> default behavior
  this.selectedSuspectName = suspectName;

this.service.getIncidentsBySuspect(suspectId).subscribe({
  next: (data) => {
    this.incidentLogs = data.logs;          // ✅ Valid now
    this.suspectPhoto = data.suspectPhoto;  // Optional usage
    this.modalService.open(this.incidentModal, { size: 'lg' });
  },
  error: (err) => {
    console.error('Failed to load incidents:', err);
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
