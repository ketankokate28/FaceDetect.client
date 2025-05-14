import { Component, input, OnInit, ViewChild } from '@angular/core';
import { NotificationAlertService } from '../../services/notification-alert.service';
import { NotificationAlert } from '../../models/NotificationAlert.model';
import { SearchBoxComponent } from './search-box.component';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { FormsModule } from '@angular/forms';
import { AutofocusDirective } from '../../directives/autofocus.directive';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule, formatDate, NgClass } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-notification-alert-page',
  templateUrl: './notification-alert-page.component.html',
    styleUrls: ['./notification-alert-page.component.scss',],
 imports: [SearchBoxComponent, NgxDatatableModule, FormsModule, AutofocusDirective, NgbTooltip, NgClass, TranslateModule, CommonModule]
    
})
export class NotificationAlertPageComponent implements OnInit {

  notificationSummary: any[] = [];
  notificationDetails: any[] = [];
  selectedNotification: any;
  selectedRecipient: any;
selectedNotificationId: number | null = null;
selectedRecipientId: number | null = null;
 summaryData: any[] = [];
  columns: any[] = [];
  
  @ViewChild('notificationId', { static: true }) notificationIdTemplate: any;
    readonly verticalScrollbar = input(false);
  constructor(private notificationAlertService: NotificationAlertService) { }

  ngOnInit(): void {
    this.columns = [
 {
    name: 'Notification ID',
    prop: 'notification_id',
    cellTemplate: this.notificationIdTemplate,
    width: 180,  // You can reduce this further if needed (e.g., 100 or 90)
    canAutoResize: false,  // Prevent ngx-datatable from auto-expanding the column
    resizeable: false
  },
      { name: 'Message', prop: 'message' },
      { name: 'Suspect', prop: 'suspect_name' },
      { name: 'Recipient', prop: 'recipient_name' }
    ];

    this.loadSummary();
  }

loadNotificationSummary(): void {
  this.notificationAlertService.getNotificationSummary().subscribe(data => {
    this.notificationSummary = data;
    //console.log('Summary response:', data); // ✅ for debugging
  });
}
loadSummary(): void {
    this.notificationAlertService.getNotificationSummary().subscribe(data => {
      this.summaryData = data;
    });
  }

isModalVisible = false;

showDetails(notificationId: number, recipientId: number): void {
  this.notificationAlertService.getNotificationDetails(notificationId, recipientId).subscribe(data => {
    this.notificationDetails = data;
    this.isModalVisible = true;
  });
}

closeModal(): void {
  this.isModalVisible = false;
}

  // Template reference will be set later in viewChild
  //notificationIdTemplate: any;

onSelectNotification(row: any): void {
  this.selectedNotificationId = row.notification_id;
  this.selectedRecipientId = row.recipient_id;

  if (this.selectedNotificationId && this.selectedRecipientId) {
    this.notificationAlertService
      .getNotificationDetails(this.selectedNotificationId, this.selectedRecipientId)
      .subscribe(data => {
        this.notificationDetails = data;
        console.log('Loaded details:', data);
      });
  }
}
  // Load detailed delivery information
  loadNotificationDetails(notificationId: number, recipientId: number): void {
    this.notificationAlertService.getNotificationDetails(notificationId, recipientId).subscribe(data => {
      this.notificationDetails = data;
    });
  }
}
