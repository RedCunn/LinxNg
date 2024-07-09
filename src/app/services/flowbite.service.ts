import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { initFlowbite } from 'flowbite';

@Injectable({
  providedIn: 'root'
})
export class FlowbiteService {

  constructor(@Inject(PLATFORM_ID) private platformId: any) {}

  loadFlowbite() {
    if (isPlatformBrowser(this.platformId)) {
      initFlowbite();
    }
  }
}
