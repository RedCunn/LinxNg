import { Component, inject, Input, signal } from '@angular/core';
import { IArticle } from '../../../../models/account/IArticle';
import { UtilsService } from '../../../../services/utils.service';
import { IUser } from '../../../../models/account/IUser';

@Component({
  selector: 'app-articlestray',
  standalone: true,
  imports: [],
  templateUrl: './articlestray.component.html',
  styleUrl: './articlestray.component.scss'
})
export class ArticlestrayComponent {

  @Input() isUser = signal(false);
  @Input() loadingArts = signal(true);
  @Input() articles : IArticle[] = []; 
  @Input() isArtFormOpen = signal(false);
  @Input() article! : IArticle;

  private utilsvc: UtilsService = inject(UtilsService);

  public mainuser! : IUser;
  public currentDate: Date = new Date();

  constructor(){
    this.loadProfileArticles()
  }

  formatDate(postedon: string): string {
    return this.utilsvc.formatDateISOStringToLegible(postedon)
  }

  loadProfileArticles() {
    let sortedArticles: IArticle[] = [];
    sortedArticles = this.utilsvc.sortArticlesDateDESC(this.articles)
    this.articles = sortedArticles;
    this.loadingArts.set(false);
  }

  toggleArtFormModal(article: IArticle | null) {
    if (article !== null) {
      this.article = article
    } else {
      this.article = { title: '', body: '', img: '', postedOn: '', useAsProfilePic: false }
    }
    this.isArtFormOpen.update(v => !v);
  }

}
