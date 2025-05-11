// ---------------------------------------
// Email: xyz@pqr.com
// Templates: /templates
// (c) 2024 /mit-license
// ---------------------------------------

import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { fadeInOut } from '../../services/animations';
import { SuspectPageComponent } from '../controls/suspect-page.component';
import { NotificationAlertPageComponent } from '../controls/notification-alert-page.component';

@Component({
    selector: 'app-notification-page-view',
    templateUrl: './notification-page-view.component.html',
    styleUrl: './notification-page-view.component.scss',
    animations: [fadeInOut],
    imports: [NotificationAlertPageComponent, TranslateModule]
})
export class NotificationPageViewComponent {

}
