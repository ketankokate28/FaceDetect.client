// ---------------------------------------
// Email: xyz@pqr.com
// Templates: /templates
// (c) 2024 /mit-license
// ---------------------------------------

import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { fadeInOut } from '../../services/animations';
import { PolicestationViewComponent } from '../controls/policestation-view.component';

@Component({
    selector: 'app-policestation',
    templateUrl: './policestation.component.html',
    styleUrl: './policestation.component.scss',
    animations: [fadeInOut],
    imports: [PolicestationViewComponent, TranslateModule]
})
export class PolicestationComponent {

}
