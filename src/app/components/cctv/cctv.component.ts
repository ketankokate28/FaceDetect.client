import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { fadeInOut } from '../../services/animations';

import { Site } from '../../models/site.model';
import { SiteService } from '../../services/site.service';
import { CctvViewComponent } from '../controls/cctv-view.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subnode, Tenant,Node } from '../../models/hierarchy.model';
import { HierarchyService } from '../../services/hierarchy.service';

@Component({
  selector: 'app-cctv',
  templateUrl: './cctv.component.html',
  styleUrl: './cctv.component.scss',
  animations: [fadeInOut],
  standalone: true,
  imports: [CctvViewComponent, TranslateModule,CommonModule,FormsModule]
})
export class CCTVComponent implements OnInit {

  sites: Site[] = [];
  loading = false;
  showCamerasForSiteId: number | null = null;
tenants: Tenant[] = [];
nodes: Node[] = [];
subnodes: Subnode[] = [];
selectedTenantId: number = 0;
selectedNodeId: number = 0;

 siteEdit: Site = {} as Site;

  @ViewChild('siteModal') siteModal!: TemplateRef<any>;
  private modalRef: any;

  constructor(
    private siteService: SiteService,
    public modalService: NgbModal,
    private hierarchyService: HierarchyService, private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSites();
    this.loadHierarchy().then(() => {
  if (this.siteEdit?.subnode_id) {
    this.preselectHierarchy();
  }
});
  }
loadHierarchy(): Promise<void> {
  return new Promise(resolve => {
    this.hierarchyService.getHierarchy().subscribe(data => {
      this.tenants = data;
      resolve();
    });
  });
}

preselectHierarchy() {
  const subnodeId = this.siteEdit.subnode_id;

  for (const tenant of this.tenants) {
    for (const node of tenant.nodes) {
      for (const subnode of node.subnodes) {
        if (subnode.id === subnodeId) {
          this.selectedTenantId = tenant.id;
          this.nodes = tenant.nodes;
          this.selectedNodeId = node.id;
          this.subnodes = node.subnodes;
          return;
        }
      }
    }
  }

  this.selectedTenantId = 0;
  this.selectedNodeId = 0;
  this.subnodes = [];
}

onTenantChange() {
  const tenant = this.tenants.find(t => t.id === +this.selectedTenantId);
  this.nodes = tenant ? tenant.nodes : [];
  this.selectedNodeId = 0;
  this.subnodes = [];
  this.siteEdit.subnode_id = 0;
}

onNodeChange() {
  const node = this.nodes.find(n => n.id === +this.selectedNodeId);
  this.subnodes = node ? node.subnodes : [];
  this.siteEdit.subnode_id = 0;
}
  loadSites() {
    this.loading = true;
    this.siteService.getSites().subscribe({
      next: data => {
        this.sites = data;
        this.loading = false;
      },
      error: err => {
        console.error('Error loading sites', err);
        this.loading = false;
      }
    });
  }

  addSite() {
    this.siteEdit = {} as Site;
      this.loadHierarchy().then(() => {
    // reset hierarchy selections
    this.selectedTenantId = 0;
    this.selectedNodeId = 0;
    this.subnodes = [];
  });
    this.modalRef = this.modalService.open(this.siteModal);
  }

  editSite(site: Site) {
    this.siteEdit = { ...site };
     this.loadHierarchy().then(() => {
    if (this.siteEdit.subnode_id) {
      this.preselectHierarchy();
    }
  });
    this.modalRef = this.modalService.open(this.siteModal);
  }

  saveSite() {
    const save$ = this.siteEdit.id
      ? this.siteService.updateSite(this.siteEdit.id, this.siteEdit)
      : this.siteService.createSite(this.siteEdit);

    save$.subscribe({
      next: () => {
        this.loadSites();
        this.modalRef.close();
      },
      error: err => console.error('Save site error', err)
    });
  }

  deleteSite(site: Site) {
    if (!confirm(`Delete site "${site.name}"?`)) return;

    this.siteService.deleteSite(site.id!).subscribe({
      next: () => this.loadSites(),
      error: err => console.error('Delete site error', err)
    });
  }

  showCameras(siteId: number) {
    this.showCamerasForSiteId = siteId;
  }

  closeCameras() {
    this.showCamerasForSiteId = null;
  }
}
