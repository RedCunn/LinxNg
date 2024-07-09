import { Component } from '@angular/core';
import { WelcomefooterComponent } from '../layouts/welcomefooter/welcomefooter.component';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [WelcomefooterComponent],
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss', '../../scss/base/base.scss']
})
export class WelcomeComponent {


}
