import { Component, input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { PoliceStation } from '../../models/police-station.model';
import { PoliceStationService } from '../../services/police-station.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { TableColumn, NgxDatatableModule } from '@siemens/ngx-datatable';
import { SearchBoxComponent } from "./search-box.component";

@Component({
  selector: 'app-policestation-view',
  templateUrl: './policestation-view.component.html',
  styleUrls: ['./policestation-view.component.scss'],
  imports: [NgxDatatableModule, FormsModule, TranslateModule, CommonModule, SearchBoxComponent]
})
export class PolicestationViewComponent implements OnInit {
  @ViewChild('actionsTemplate', { static: true }) actionsTemplate!: TemplateRef<any>;
  @ViewChild('editorModal') editorModal!: TemplateRef<any>;

  columns = [
    { name: 'ID', prop: 'id' },
    { name: 'Name', prop: 'name' },
    { name: 'Address', prop: 'address' },
    { name: 'Contact Number', prop: 'contactNumber' },
    { name: 'State', prop: 'state' },
    { name: 'Taluka', prop: 'taluka' },
    { name: 'Status', prop: 'status' },
    { name: 'Action', prop: 'action', cellTemplate: this.actionsTemplate }
  ];

  rows: PoliceStation[] = [];
  rowsCache: PoliceStation[] = [];
  loadingIndicator = true;

  policestationEdit: PoliceStation = {} as PoliceStation;
  modalRef: any;

  // Mock States and Talukas data
  states = [
    { name: 'Maharashtra', talukas: ['Pune', 'Nagpur', 'Nashik', 'Aurangabad'] },
    { name: 'Gujarat', talukas: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'] },
    { name: 'Karnataka', talukas: ['Bangalore', 'Mysore', 'Mangalore', 'Hubli'] },
    { name: 'Tamil Nadu', talukas: ['Chennai', 'Coimbatore', 'Madurai', 'Salem'] }
  ];

  talukasForSelectedState: string[] = [];
 readonly verticalScrollbar = input(false);
  constructor(
    private modalService: NgbModal,
    private policestationService: PoliceStationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadPolicestations();
  }

  loadPolicestations(): void {
    this.policestationService.getPoliceStations().subscribe({
      next: (data) => {
        this.rowsCache = [...data];
        this.rows = [...data];
        this.loadingIndicator = false;
      },
      error: (error) => {
        console.error('Error loading Policestation data:', error);
        this.loadingIndicator = false;
        if (error?.error?.msg === 'Token has expired') {
          this.authService.reLogin();
        }
      }
    });
  }

  openEditor(row?: PoliceStation) {
    this.policestationEdit = row ? { ...row } : {} as PoliceStation;
    this.onStateChange(); // load talukas for the selected state
    this.modalRef = this.modalService.open(this.editorModal, { size: 'lg' });
  }

  onStateChange() {
    const found = this.states.find(s => s.name === this.policestationEdit.state);
    this.talukasForSelectedState = found ? found.talukas : [];
    // Reset taluka if not in current talukas
    if (!this.talukasForSelectedState.includes(this.policestationEdit.taluka)) {
      this.policestationEdit.taluka = '';
    }
  }

  savePolicestation() {
    if (this.policestationEdit.id) {
      this.policestationService.updatePoliceStation(this.policestationEdit.id, this.policestationEdit).subscribe({
        next: () => {
          this.loadPolicestations();
          this.modalRef.close();
        },
        error: (error) => {
          console.error('Error updating Policestation:', error);
          if (error?.error?.msg === 'Token has expired') this.authService.reLogin();
        }
      });
    } else {
      this.policestationService.createPoliceStation(this.policestationEdit).subscribe({
        next: () => {
          this.loadPolicestations();
          this.modalRef.close();
        },
        error: (error) => {
          console.error('Error creating Policestation:', error);
          if (error?.error?.msg === 'Token has expired') this.authService.reLogin();
        }
      });
    }
  }

  deletePolicestation(row: PoliceStation) {
    if (confirm(`Are you sure you want to delete Policestation with ID: ${row.id}?`)) {
      this.policestationService.deletePoliceStation(row.id).subscribe({
        next: () => this.loadPolicestations(),
        error: (error) => {
          console.error('Error deleting Policestation:', error);
          if (error?.error?.msg === 'Token has expired') this.authService.reLogin();
        }
      });
    }
  }

  onSearchChanged(value: string): void {
    const keyword = value.toLowerCase();
    this.rows = this.rowsCache.filter(r =>
      (r.name && r.name.toLowerCase().includes(keyword)) ||
      (r.fullAddress && r.fullAddress.toLowerCase().includes(keyword)) ||
      // (r.contactNumber && r.contactNumber.toLowerCase().includes(keyword)) ||
      (r.state && r.state.toLowerCase().includes(keyword)) ||
      (r.taluka && r.taluka.toLowerCase().includes(keyword))
    );
  }
}
