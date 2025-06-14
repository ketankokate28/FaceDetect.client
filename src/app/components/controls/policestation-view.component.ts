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
  selectedUser: User | null = null;
  states = [
  {
    name: 'Maharashtra',
    districts: [
      { name: 'Ahmednagar', talukas: ['Akole', 'Jamkhed', 'Karjat', 'Kopargaon', 'Nagar', 'Nevasa', 'Parner', 'Pathardi', 'Rahata', 'Rahuri', 'Sangamner', 'Shevgaon', 'Shrigonda', 'Shrirampur'] },
      { name: 'Akola', talukas: ['Akola', 'Balapur', 'Murtijapur', 'Patur', 'Telhara'] },
      { name: 'Amravati', talukas: ['Amravati', 'Achalpur', 'Anjangaon', 'Chandur Railway', 'Daryapur', 'Dhamangaon', 'Morshi', 'Teosa', 'Warud'] },
      { name: 'Aurangabad', talukas: ['Aurangabad', 'Gangapur', 'Kannad', 'Khuldabad', 'Paithan', 'Phulambri', 'Sillod', 'Vaijapur'] },
      { name: 'Beed', talukas: ['Ashti', 'Beed', 'Georai', 'Kaij', 'Majalgaon', 'Parli', 'Patoda', 'Shirur Kasar', 'Wadwani'] },
      { name: 'Bhandara', talukas: ['Bhandara', 'Mohadi', 'Pauni', 'Sakoli', 'Tumsar'] },
      { name: 'Buldhana', talukas: ['Buldhana', 'Chikhli', 'Deulgaon Raja', 'Jalgaon Jamod', 'Khamgaon', 'Lonar', 'Mehkar', 'Motala', 'Nandura', 'Sangrampur', 'Shegaon'] },
      { name: 'Chandrapur', talukas: ['Ballarpur', 'Bhadravati', 'Chandrapur', 'Nagbhid', 'Rajura', 'Sindewahi', 'Warora'] },
      { name: 'Dhule', talukas: ['Dhule', 'Sakri', 'Shirpur'] },
      { name: 'Gadchiroli', talukas: ['Armori', 'Bhamragad', 'Dhanora', 'Etapalli', 'Gadchiroli', 'Korchi', 'Kurkheda', 'Mulchera', 'Sironcha'] },
      { name: 'Gondia', talukas: ['Amgaon', 'Arjuni Morgaon', 'Deori', 'Gondia', 'Goregaon', 'Sadak Arjuni', 'Salekasa', 'Tirora'] },
      { name: 'Hingoli', talukas: ['Aundha Nagnath', 'Basmath', 'Hingoli', 'Kalamnuri', 'Sengaon'] },
      { name: 'Jalgaon', talukas: ['Amalner', 'Bhadgaon', 'Bhusawal', 'Chalisgaon', 'Chopda', 'Erandol', 'Jalgaon', 'Jamner', 'Pachora', 'Parola', 'Yawal'] },
      { name: 'Jalna', talukas: ['Ambad', 'Bhokardan', 'Ghansawangi', 'Jalna', 'Mantha', 'Partur'] },
      { name: 'Kolhapur', talukas: ['Ajara', 'Bhudargad', 'Chandgad', 'Gadhinglaj', 'Hatkanangle', 'Karvir', 'Panhala', 'Radhanagari', 'Shahuwadi', 'Shirol'] },
      { name: 'Latur', talukas: ['Ahmedpur', 'Ausa', 'Chakur', 'Deoni', 'Jalkot', 'Latur', 'Nilanga', 'Renapur', 'Shirur Anantpal', 'Udgir'] },
      { name: 'Mumbai City', talukas: ['Mumbai'] },
      { name: 'Mumbai Suburban', talukas: ['Andheri', 'Borivali', 'Kurla'] },
      { name: 'Nagpur', talukas: ['Nagpur Rural', 'Nagpur Urban', 'Hingna', 'Kamptee', 'Katol', 'Mauda', 'Narkhed', 'Parseoni', 'Ramtek', 'Saoner', 'Umred'] },
      { name: 'Nanded', talukas: ['Ardhapur', 'Biloli', 'Bhokar', 'Deglur', 'Hadgaon', 'Himayatnagar', 'Kinwat', 'Loha', 'Mahur', 'Mudkhed', 'Mukhed', 'Naigaon', 'Nanded'] },
      { name: 'Nandurbar', talukas: ['Akkalkuwa', 'Akrani', 'Nandurbar', 'Navapur', 'Shahada', 'Taloda'] },
      { name: 'Nashik', talukas: ['Baglan', 'Chandwad', 'Deola', 'Dindori', 'Igatpuri', 'Kalwan', 'Malegaon', 'Nandgaon', 'Nashik', 'Niphad', 'Peth', 'Sinnar', 'Trimbak', 'Yeola'] },
      { name: 'Osmanabad', talukas: ['Kalamb', 'Lohara', 'Osmanabad', 'Paranda', 'Tuljapur', 'Umarga', 'Vashi'] },
      { name: 'Palghar', talukas: ['Dahanu', 'Jawhar', 'Mokhada', 'Palghar', 'Talasari', 'Vasai', 'Vikramgad', 'Wada'] },
      { name: 'Parbhani', talukas: ['Gangakhed', 'Jintur', 'Manwath', 'Parbhani', 'Pathri', 'Purna', 'Sailu', 'Sonpeth'] },
      { name: 'Pune', talukas: ['Baramati', 'Bhor', 'Daund', 'Haveli', 'Indapur', 'Junnar', 'Khed', 'Mulshi', 'Purandar', 'Shirur', 'Velhe'] },
      { name: 'Raigad', talukas: ['Alibag', 'Karjat', 'Khalapur', 'Mahad', 'Mangaon', 'Murud', 'Panvel', 'Pen', 'Poladpur', 'Roha', 'Shrivardhan', 'Sudhagad', 'Tala', 'Uran'] },
      { name: 'Ratnagiri', talukas: ['Chiplun', 'Dapoli', 'Guhagar', 'Khed', 'Lanja', 'Mandangad', 'Rajapur', 'Ratnagiri', 'Sangameshwar'] },
      { name: 'Sangli', talukas: ['Atpadi', 'Jat', 'Kavathe Mahankal', 'Khanapur', 'Miraj', 'Palus', 'Shirala', 'Tasgaon', 'Walwa'] },
      { name: 'Satara', talukas: ['Jaoli', 'Khandala', 'Koregaon', 'Mahabaleshwar', 'Man', 'Patan', 'Phaltan', 'Satara', 'Wai'] },
      { name: 'Sindhudurg', talukas: ['Devgad', 'Kankavli', 'Kudal', 'Malvan', 'Sawantwadi', 'Vaibhavwadi', 'Vengurla'] },
      { name: 'Solapur', talukas: ['Akkalkot', 'Barshi', 'Karmala', 'Madha', 'Malshiras', 'Mangalwedha', 'Mohol', 'Pandharpur', 'Sangola', 'Solapur North', 'Solapur South'] },
      { name: 'Thane', talukas: ['Ambarnath', 'Bhiwandi', 'Kalyan', 'Murbad', 'Shahapur', 'Ulhasnagar'] },
      { name: 'Wardha', talukas: ['Arvi', 'Ashti', 'Deoli', 'Hinganghat', 'Samudrapur', 'Seloo', 'Wardha'] },
      { name: 'Washim', talukas: ['Karanja', 'Malegaon', 'Mangrulpir', 'Manora', 'Risod', 'Washim'] },
      { name: 'Yavatmal', talukas: ['Arni', 'Babulgaon', 'Darwha', 'Digras', 'Ghatanji', 'Kalamb', 'Kelapur', 'Mahagaon', 'Ner', 'Pusad', 'Ralegaon', 'Umarkhed', 'Wani', 'Yavatmal'] }
    ]
  },
  {
    name: 'Gujarat',
    districts: [
      { name: 'Ahmedabad', talukas: ['Ahmedabad City', 'Dascroi', 'Sanand', 'Detroj-Rampura', 'Dholka', 'Bavla'] },
      { name: 'Amreli', talukas: ['Amreli', 'Bagasara', 'Dhari', 'Jafrabad', 'Khambha', 'Kunkavav', 'Lathi', 'Rajula', 'Savarkundla'] },
      { name: 'Anand', talukas: ['Anand', 'Anklav', 'Borsad', 'Petlad', 'Sojitra', 'Tarapur', 'Umreth'] },
      { name: 'Aravalli', talukas: ['Bayad', 'Bhiloda', 'Dhansura', 'Malpur', 'Meghraj', 'Modasa'] },
      { name: 'Banaskantha', talukas: ['Amirgadh', 'Bhabhar', 'Danta', 'Dantiwada', 'Deesa', 'Kankrej', 'Palanpur', 'Tharad', 'Vadgam', 'Vav'] },
      { name: 'Bharuch', talukas: ['Amod', 'Ankleshwar', 'Bharuch', 'Hansot', 'Jambusar', 'Jhagadia', 'Valia', 'Vagra'] },
      { name: 'Bhavnagar', talukas: ['Bhavnagar', 'Gariadhar', 'Ghogha', 'Mahuva', 'Palitana', 'Sihor', 'Talaja', 'Umrala'] },
      { name: 'Botad', talukas: ['Botad', 'Barwala', 'Gadhada', 'Ranpur'] },
      { name: 'Chhota Udaipur', talukas: ['Bodeli', 'Chhota Udaipur', 'Jetpur Pavi', 'Kawant', 'Naswadi', 'Sankheda'] },
      { name: 'Dahod', talukas: ['Dahod', 'Devgadh Baria', 'Fatepura', 'Garbhada', 'Limkheda', 'Sanjeli', 'Zalod'] },
      { name: 'Dang', talukas: ['Ahwa'] },
      { name: 'Devbhoomi Dwarka', talukas: ['Dwarka', 'Kalyanpur', 'Khambhalia', 'Bhanvad'] },
      { name: 'Gandhinagar', talukas: ['Gandhinagar', 'Dehgam', 'Kalol', 'Mansa'] },
      { name: 'Gir Somnath', talukas: ['Kodinar', 'Veraval', 'Una', 'Sutrapada', 'Talala'] },
      { name: 'Jamnagar', talukas: ['Jamnagar', 'Jodiya', 'Kalavad', 'Lalpur', 'Dhrol'] },
      { name: 'Junagadh', talukas: ['Junagadh', 'Keshod', 'Manavadar', 'Malia', 'Mangrol', 'Vanthali', 'Visavadar'] },
      { name: 'Kheda', talukas: ['Kapadvanj', 'Kathlal', 'Kheda', 'Mahemdavad', 'Mahudha', 'Matar', 'Mehmedabad', 'Nadiad', 'Thasra', 'Vaso'] },
      { name: 'Kutch', talukas: ['Abdasa', 'Anjar', 'Bhachau', 'Bhuj', 'Gandhidham', 'Lakhpat', 'Mandvi', 'Mundra', 'Nakhatrana', 'Rapar'] },
      { name: 'Mehsana', talukas: ['Becharaji', 'Kadi', 'Kheralu', 'Mehsana', 'Satlasana', 'Unjha', 'Vadnagar', 'Visnagar', 'Vijapur'] },
      { name: 'Morbi', talukas: ['Halvad', 'Morbi', 'Tankara', 'Wankaner', 'Maliya'] },
      { name: 'Narmada', talukas: ['Dediapada', 'Garudeshwar', 'Nandod', 'Sagbara', 'Tilakwada'] },
      { name: 'Navsari', talukas: ['Chikhli', 'Gandevi', 'Jalalpore', 'Navsari', 'Vansda'] },
      { name: 'Panchmahal', talukas: ['Ghoghamba', 'Godhra', 'Halol', 'Jambughoda', 'Kalol', 'Lunawada', 'Morva Hadaf', 'Santrampur', 'Shehera'] },
      { name: 'Patan', talukas: ['Chanasma', 'Harij', 'Patan', 'Radhanpur', 'Sami', 'Sankheswar', 'Santalpur', 'Sarasvati', 'Shankheshwar'] },
      { name: 'Porbandar', talukas: ['Porbandar', 'Kutiyana', 'Ranavav'] },
      { name: 'Rajkot', talukas: ['Dhoraji', 'Gondal', 'Jamkandorna', 'Jasdan', 'Jetpur', 'Kotda Sangani', 'Lodhika', 'Paddhari', 'Rajkot'] },
      { name: 'Sabarkantha', talukas: ['Bayad', 'Idar', 'Himatnagar', 'Khedbrahma', 'Malpur', 'Modasa', 'Poshina', 'Prantij', 'Talod', 'Vadali', 'Vijaynagar'] },
      { name: 'Surat', talukas: ['Bardoli', 'Choryasi', 'Kamrej', 'Mandvi', 'Mangrol', 'Mahuva', 'Olpad', 'Palsana', 'Surat City', 'Umarpada'] },
      { name: 'Surendranagar', talukas: ['Chotila', 'Dhrangadhra', 'Lakhtar', 'Limbdi', 'Muli', 'Sayla', 'Thangadh', 'Wadhwan'] },
      { name: 'Tapi', talukas: ['Dolvan', 'Kukarmunda', 'Nizar', 'Songadh', 'Uchchhal', 'Vyara'] },
      { name: 'Vadodara', talukas: ['Chhota Udaipur', 'Dabhoi', 'Karjan', 'Padra', 'Savli', 'Sinor', 'Vadodara'] },
      { name: 'Valsad', talukas: ['Dharampur', 'Kaprada', 'Pardi', 'Umbergaon', 'Valsad'] }
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
  return this.users.find(u => u.id == id.toString()) || null;
}
openEditor(row?: PoliceStation) {
  this.policestationEdit = row ? { ...row } : {} as PoliceStation;

  // First resolve districts based on state
  const selectedState = this.states.find(s => s.name === this.policestationEdit.state);
  this.districtsForSelectedState = selectedState?.districts || [];

  // Now resolve talukas based on district
  const selectedDistrict = this.districtsForSelectedState.find(d => d.name === this.policestationEdit.district);
  this.talukasForSelectedDistrict = selectedDistrict?.talukas || [];
this.selectedUser = this.getUserById(this.policestationEdit.stationHouseOfficerId);

  this.modalRef = this.modalService.open(this.editorModal, { size: 'lg' });
}
onUserSelected(event: any) {
  const user = event.item;
  this.policestationEdit.stationHouseOfficerId = user.id;
  this.policestationEdit.stationHouseOfficerName = user.fullName;
  console.log(this.policestationEdit.stationHouseOfficerName); // Debugging line
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
