import { AfterViewInit, Component, HostListener, inject, Inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { initTooltips } from 'flowbite';
import { MatchcarouselComponent } from '../matchcarousel/matchcarousel.component';
import { FlowbiteService } from '../../services/flowbite.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-getstarted',
  standalone: true,
  imports: [MatchcarouselComponent],
  templateUrl: './getstarted.component.html',
  styleUrls: ['./getstarted.component.scss']
})
export class GetstartedComponent implements AfterViewInit, OnInit {

  private flowbitesvc = inject(FlowbiteService);
  public tipsUnseen: string[] = ['Match', 'Linx', 'Cadena'];
  public tipsToRead: string[] = ['Match'];
  timeoutId: any;

  constructor(private router: Router) { }

  get shouldAnimate(): boolean {
    return this.tipsUnseen.includes('Match') && this.tipsToRead.includes('Match');
  }
  
  mousOverReadTip(event: MouseEvent) {
    if (this.tipsUnseen.length > 0) {
      const divElement = event.target as HTMLElement;
      let divid = divElement.id

      const index = this.tipsUnseen.findIndex(tip => tip === divid)

      if (index !== -1) {
        this.tipsUnseen.splice(index, 1)
        this.tipsToRead = [];
      }
    }
  }

  mouseOutNextTip(event: MouseEvent) {
    if (this.tipsUnseen.length > 0) {
      this.tipsToRead = [];
      clearTimeout(this.timeoutId);
      this.timeoutId = setTimeout(() => this.tipsToRead.push(this.tipsUnseen[0]), 1000);
    }
  }

  goToMeeting() {
    this.router.navigateByUrl('/Linx/conectar')
  }

  ngOnInit(): void {
    this.flowbitesvc.loadFlowbite()
  }

  ngAfterViewInit(): void {
    initTooltips();
  }

}
