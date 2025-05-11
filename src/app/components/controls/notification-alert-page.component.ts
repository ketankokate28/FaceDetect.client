import { Component, input, OnInit } from '@angular/core';
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
    notificationAlerts: NotificationAlert[] = [];
    filteredNotificationAlerts: NotificationAlert[] = [];
    selectedNotificationAlert: NotificationAlert = this.createEmptyNotificationAlert();
    showModal: boolean = false;
  
    channelOptions: string[] = ['email', 'sms', 'webhook'];
    readonly verticalScrollbar = input(false);
    private refreshIntervalId: any; //
    constructor(private notificationAlertService: NotificationAlertService) {}
  
    ngOnInit(): void {
      this.fetchNotificationAlerts();
      // 👇 Set up interval to refresh every 10 seconds
    this.refreshIntervalId = setInterval(() => {
        this.fetchNotificationAlerts();
      }, 10000); // 10000 ms = 10 seconds
    }
  
    ngOnDestroy(): void {
        if (this.refreshIntervalId) {
          clearInterval(this.refreshIntervalId); // 👈 Clean up the interval
        }
      }

      fetchNotificationAlerts(): void {
        this.notificationAlertService.getAll().subscribe({
          next: (data) => {
            this.notificationAlerts = data;
            this.filteredNotificationAlerts = [...this.notificationAlerts];
          },
          error: (err) => {
            console.error('Failed to fetch notification alerts', err);
          }
        });
      }
  
    filterDatatable(searchText: string): void {
      const lowerText = searchText.toLowerCase();
      this.filteredNotificationAlerts = this.notificationAlerts.filter(alert =>
        JSON.stringify(alert).toLowerCase().includes(lowerText)
      );
    }
  
    openAddModal(): void {
      this.selectedNotificationAlert = this.createEmptyNotificationAlert();
      this.showModal = true;
    }
  
    editNotificationAlert(alert: NotificationAlert): void {
      this.selectedNotificationAlert = { ...alert }; // clone object
      this.showModal = true;
    }
  
    closeModal(): void {
      this.showModal = false;
    }
  
    saveNotificationAlert(): void {
      const alert = { ...this.selectedNotificationAlert };
  
      
    }
  
    deleteNotificationAlert(alert: NotificationAlert): void {

    }
  
    private createEmptyNotificationAlert(): NotificationAlert {
      return {
        notification_id: 1,
        channel: 'email',
        cctv_id: 2,
        match_id: 2,
        payload: '',
        recipient: '',
        created_at: this.formatDateTime(new Date()),
        last_attempt_at: this.formatDateTime(new Date()),
        attempt_count: 0,
        status: 'sent',
        last_error: ''
      };
    }
  
    private formatDateTime(date: Date): string {
      return formatDate(date, "yyyy-MM-dd'T'HH:mm", 'en-US'); // for datetime-local input
    }
  }