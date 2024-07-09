import { AfterViewInit, Component, inject, Inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import {initTooltips } from 'flowbite';
import { MatchcarouselComponent} from '../matchcarousel/matchcarousel.component';
import { FlowbiteService } from '../../services/flowbite.service';


@Component({
  selector: 'app-getstarted',
  standalone: true,
  imports: [MatchcarouselComponent],
  templateUrl: './getstarted.component.html',
  styleUrls: ['./getstarted.component.scss']
})
export class GetstartedComponent implements AfterViewInit, OnInit{
  public showMeetingZone = signal(false);
  private flowbitesvc = inject(FlowbiteService);

  constructor(){}
  
  ngOnInit(): void {
    this.flowbitesvc.loadFlowbite()
  }

  ngAfterViewInit(): void {
    initTooltips();
  }

}
