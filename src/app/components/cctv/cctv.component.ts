// ---------------------------------------
// Email: xyz@pqr.com
// Templates: /templates
// (c) 2024 /mit-license
// ---------------------------------------

import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { fadeInOut } from '../../services/animations';
import { CctvViewComponent } from '../controls/cctv-view.component';

@Component({
    selector: 'app-cctv',
    templateUrl: './cctv.component.html',
    styleUrl: './cctv.component.scss',
    animations: [fadeInOut],
    imports: [CctvViewComponent, TranslateModule]
})
export class CCTVComponent {

}
