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
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { User } from '../../models/user.model'; // Ensure this exists
import { AccountService } from '../../services/account.service';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-policestation-view',
  templateUrl: './policestation-view.component.html',
  styleUrls: ['./policestation-view.component.scss'],
  imports: [NgxDatatableModule, FormsModule, TranslateModule, CommonModule, SearchBoxComponent, NgbTypeaheadModule]
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
  users: User[] = [];
  policestationEdit: PoliceStation = {} as PoliceStation;
  modalRef: any;
  selectedUser: any = null;
  states = [
  {
    name: 'Maharashtra',
    districts: [
      { name: 'Pune', talukas: ['Haveli', 'Mulshi', 'Shirur'] },
      { name: 'Nagpur', talukas: ['Nagpur Rural', 'Kamptee'] },
      { name: 'Nashik', talukas: ['Sinnar', 'Igatpuri'] }
    ]
  },
  {
    name: 'Gujarat',
    districts: [
      { name: 'Ahmedabad', talukas: ['Dascroi', 'Sanand'] },
      { name: 'Surat', talukas: ['Choryasi', 'Bardoli'] }
    ]
  }
];
districtsForSelectedState: { name: string; talukas: string[] }[] = [];
talukasForSelectedDistrict: string[] = [];
talukasForSelectedState: string[] = [];
 readonly verticalScrollbar = input(false);
  constructor(
    private modalService: NgbModal,
    private policestationService: PoliceStationService,
    private authService: AuthService,
    private accountService: AccountService
  ) {}

  ngOnInit(): void {
    this.loadPolicestations();
     this.loadUsers();
  }
loadUsers() {
  this.accountService.getUsersAndRoles().subscribe({
    next: ([users, _roles]) => {
      this.users = users;
    },
    error: (error) => {
      console.error('Error loading users:', error);
      if (error?.error?.msg === 'Token has expired') {
        this.authService.reLogin();
      }
    }
  });
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
searchUsers = (text$: Observable<string>) =>
  text$.pipe(
    debounceTime(200),
    distinctUntilChanged(),
    map(term =>
      term.length < 2 ? [] :
      this.users
        .filter(user => user.fullName?.toLowerCase().includes(term.toLowerCase()))
        .slice(0, 10)
    )
  );

userFormatter = (user: any) => user.fullName || '';

getUserById(id: string | number | null): User | null {
  if (!id) return null;
  return this.users.find(u => u.id === id.toString()) || null;
}
openEditor(row?: PoliceStation) {
  this.policestationEdit = row ? { ...row } : {} as PoliceStation;

  // First resolve districts based on state
  const selectedState = this.states.find(s => s.name === this.policestationEdit.state);
  this.districtsForSelectedState = selectedState?.districts || [];

  // Now resolve talukas based on district
  const selectedDistrict = this.districtsForSelectedState.find(d => d.name === this.policestationEdit.district);
  this.talukasForSelectedDistrict = selectedDistrict?.talukas || [];

this.selectedUser = this.users.find(
  user => user.id == String(row?.stationHouseOfficerId)
);
    

  this.modalRef = this.modalService.open(this.editorModal, { size: 'lg' });
}
onUserSelected(event: any) {
  const user = event.item;
  this.policestationEdit.stationHouseOfficerId = user.id;
  this.policestationEdit.stationHouseOfficerName = user.fullName;
}
onStateChange() {
  const selectedState = this.states.find(s => s.name === this.policestationEdit.state);
  this.districtsForSelectedState = selectedState?.districts || [];
  
  // Reset district and taluka
  if (!this.districtsForSelectedState.find(d => d.name === this.policestationEdit.district)) {
    this.policestationEdit.district = '';
    this.talukasForSelectedDistrict = [];
  } else {
    this.onDistrictChange();
  }
}
onDistrictChange() {
  const selectedDistrict = this.districtsForSelectedState.find(d => d.name === this.policestationEdit.district);
  this.talukasForSelectedDistrict = selectedDistrict?.talukas || [];

  if (!this.talukasForSelectedDistrict.includes(this.policestationEdit.taluka)) {
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
