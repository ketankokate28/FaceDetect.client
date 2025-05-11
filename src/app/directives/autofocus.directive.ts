// ---------------------------------------
// Email: xyz@pqr.com
// Templates: /templates
// (c) 2024 /mit-license
// ---------------------------------------

import { Directive, ElementRef, OnInit, inject } from '@angular/core';

@Directive({
  selector: '[appAutofocus]',
  standalone: true
})
export class AutofocusDirective implements OnInit {
  elementRef = inject(ElementRef);

  ngOnInit() {
    setTimeout(() => this.elementRef.nativeElement.focus(), 500);
  }
}
