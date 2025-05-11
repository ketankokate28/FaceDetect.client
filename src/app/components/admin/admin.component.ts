// ---------------------------------------
// Email: xyz@pqr.com
// Templates: /templates
// (c) 2024 /mit-license
// ---------------------------------------

import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { fadeInOut } from '../../services/animations';

@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    styleUrl: './admin.component.scss',
    animations: [fadeInOut],
    imports: [TranslateModule]
})
export class AdminComponent {
}
