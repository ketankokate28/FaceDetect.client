// ---------------------------------------
// Email: xyz@pqr.com
// Templates: /templates
// (c) 2024 /mit-license
// ---------------------------------------

import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { fadeInOut } from '../../services/animations';
import { SuspectPageComponent } from '../controls/suspect-page.component';

@Component({
    selector: 'app-suspect',
    templateUrl: './suspect.component.html',
    styleUrl: './suspect.component.scss',
    animations: [fadeInOut],
    imports: [SuspectPageComponent, TranslateModule]
})
export class SuspectComponent {

}
