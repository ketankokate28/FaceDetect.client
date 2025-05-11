// ---------------------------------------
// Email: xyz@pqr.com
// Templates: /templates
// (c) 2024 /mit-license
// ---------------------------------------

import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { fadeInOut } from '../../services/animations';

@Component({
    selector: 'app-about',
    templateUrl: './about.component.html',
    styleUrl: './about.component.scss',
    animations: [fadeInOut],
    imports: [TranslateModule]
})
export class AboutComponent {
}
