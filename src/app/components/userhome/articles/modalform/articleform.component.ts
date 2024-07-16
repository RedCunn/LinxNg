import { Component, EventEmitter, inject, Input, OnChanges, signal, SimpleChanges } from '@angular/core';
import { RestnodeService } from '../../../../services/restnode.service';
import { IUser } from '../../../../models/account/IUser';
import { IArticle } from '../../../../models/account/IArticle';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-articleform',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './articleform.component.html',
  styleUrl: './articleform.component.scss'
})
export class ArticleformComponent implements OnChanges{

  private restSvc: RestnodeService = inject(RestnodeService);

  @Input() isOpen = signal(false);
  @Input() userdata!: IUser | null;
  @Input()
  set article(value: IArticle) {
    console.log(value);
    this.articleCopy = {articleid : value.articleid, 
                        title: value.title, 
                        body: value.body, 
                        img: value.img, 
                        postedOn: value.postedOn, 
                        useAsProfilePic: value.useAsProfilePic};
  }
  //@Input() articleChange = new EventEmitter<IArticle[]>();
  @Input() articles! : IArticle[];

  private formData : FormData = new FormData();
  private artFile: File | null = null; 
  public currentDate : Date = new Date();
  public articleCopy : IArticle = {articleid : '', title: '', body: '', img: '', postedOn: '', useAsProfilePic: false };


  constructor(){
    console.log('ARTCILE INPUT : ', this.article)
    console.log('ART COPI : ', this.articleCopy)
  }
  ngOnChanges(changes: SimpleChanges): void {
    console.log('ch ch ch ch changeeeees ',changes)
  }

  generateArticleId() {
    const randomBytes = CryptoJS.lib.WordArray.random(8);
    const articleId = CryptoJS.enc.Hex.stringify(randomBytes);
    return articleId;
  }

  generateFileName(originalName : string) {
    const fileExtention = '.'+originalName.split('.')[1];
    const hash = CryptoJS.SHA256(originalName).toString(CryptoJS.enc.Base64);
    return hash.replace(/\//g, '_').replace(/\+/g, '-').substring(0, 16) + fileExtention;
  }
  async uploadArticle(artForm: NgForm) {
    
    if(artForm.form.invalid){
      return;
    }
    this.formData = new FormData();
    this.formData.append('title', artForm.form.get('title')?.value)
    this.formData.append('body', artForm.form.get('bodycontent')?.value)
    this.formData.append('useAsProfilePic', artForm.form.get('useAsUserPic')?.value)
    
    if(this.artFile !== null){
      this.formData.append("file", this.artFile);
    }
    if (this.articleCopy.articleid !== undefined) {
      if(artForm.dirty){
        this.formData.append('postedOn', this.articleCopy.postedOn)
        this.uploadArticleChanges();   
      }
      this.isOpen.set(false);
    } else {
      this.formData.append('postedOn', this.currentDate.toISOString())
      this.uploadNewArticle()
      this.isOpen.set(false);
    }
  }

  async uploadArticleChanges(){
    try {
      
      const response = await this.restSvc.editArticle(this.userdata!.userid,this.articleCopy.articleid!, this.formData);
      if (response.code === 0) {
        console.log('RESPONSE OTHERS ON UPLOADING ART CHANGES : ', response.others)
        if(response.others !== ''){
          this.articleCopy.img = response.others;
        }
        const artIndex = this.articles.findIndex(art => art.articleid === this.articleCopy.articleid)
        if(artIndex !== -1){
          this.articles[artIndex] = this.articleCopy;
          if(this.articleCopy.useAsProfilePic){
            this.articles.forEach(art => {
              if(art.articleid !== this.articleCopy.articleid){
                art.useAsProfilePic = false;
              }
            })
          }
          //this.articleChange.emit(this.articles);
        }
        this.isOpen.set(false);
      } else {
        console.log('Error en AWAIT editArticle : ',response.error)
      } 
    } catch (error) {
      console.log('Error en AWAIT editArticle : ',error)
    }
  }

  async uploadNewArticle(){
    const _artid = this.generateArticleId().toString();
    this.articleCopy.articleid = _artid;
    this.formData.append('articleid', _artid);
    this.formData.forEach((value, key) => {
      console.log(key + ': ' + value);
  });
    try {
      const response = await this.restSvc.newArticle(this.userdata!.userid, this.formData);
      console.log('RESPONSE NEW ARTICLE ARTMODAL : ', response)
      if (response.code === 0) {
        this.articleCopy.postedOn = new Date().toISOString();
        this.articleCopy.img = response.others;
        this.articles.unshift(this.articleCopy);
        //this.articleChange.emit(this.articles);
        this.isOpen.set(false);
      } else {
        console.log('Error en AWAIT newArticle : ',response.error)
      }  
    } catch (error) {
      console.log('Error en AWAIT newArticle : ',error)
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
    const newFileName = this.generateFileName(file.name);
    const newFile = new File([file], newFileName, { type: file.type });
    this.artFile = newFile;
    }
  }

  async deleteArticle() {
    try {
      const filename = this.articleCopy.img.split('/')[1];
      const res = await this.restSvc.deleteArticle(this.userdata?.userid!, this.articleCopy.articleid!, filename);
      console.log('RESPONSE ON DELETE ARTMODAL : ', res)
      if (res.code === 0) {
        const index = this.articles.findIndex(art => art.articleid === this.articleCopy.articleid!);
        if (index !== -1) {
          this.articles.splice(index, 1);
        }
        //this.articleChange.emit(this.articles);
        this.isOpen.set(false);
        console.log('Removed article on artmodal : ', res.message)
      } else {
        console.log('Couldnt delete article on artmodal....', res.error);
      }
    } catch (error) {
      console.log('Couldnt delete article on artmodal....', error);
    }
  }
  
  async deleteArticleImg (){
    try {
      const filename = this.articleCopy.img.split('/')[1];
      const res = await this.restSvc.deleteArticleImg(this.userdata?.userid!, this.articleCopy.articleid!, filename);
      console.log('RESPONSE ON DELETE ARTIMG ARTMODAL : ', res)
      if(res.code === 0 ){
        console.log('Removed image from article on artmodal : ', res.message)
        const index = this.articles.findIndex(art => art.articleid === this.articleCopy.articleid!);
        if (index !== -1) {
          this.articles[index].img = '';
        }
        //this.articleChange.emit(this.articles);
      }else{
        console.log('Couldnt delete image from article on artmodal....', res.error);
      }
    } catch (error) {
      console.log('Couldnt delete image from article on artmodal....', error);
    }
  }

  closeModal() {
    this.isOpen.set(false);
  }

}

