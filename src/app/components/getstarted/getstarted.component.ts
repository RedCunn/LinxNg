import { AfterViewInit, Component, inject, Inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import {initTooltips } from 'flowbite';
import { MatchcarouselComponent} from '../matchcarousel/matchcarousel.component';
import { FlowbiteService } from '../../services/flowbite.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-getstarted',
  standalone: true,
  imports: [MatchcarouselComponent],
  templateUrl: './getstarted.component.html',
  styleUrls: ['./getstarted.component.scss']
})
export class GetstartedComponent implements AfterViewInit, OnInit{
  
  private flowbitesvc = inject(FlowbiteService);

  constructor(private router : Router){}
  

  goToMeeting(){
    this.router.navigateByUrl('/Linx/matching')
  }

  ngOnInit(): void {
    this.flowbitesvc.loadFlowbite()
  }

  ngAfterViewInit(): void {
    initTooltips();
  }

}
