// ---------------------------------------
// Email: xyz@pqr.com
// Templates: /templates
// (c) 2024 /mit-license
// ---------------------------------------

import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { fadeInOut } from '../../services/animations';

@Component({
    selector: 'app-products',
    templateUrl: './products.component.html',
    styleUrl: './products.component.scss',
    animations: [fadeInOut],
    imports: [TranslateModule]
})
export class ProductsComponent {
}
