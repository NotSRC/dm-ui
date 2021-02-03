import { AfterViewInit, Directive, ElementRef, Input, Renderer2 } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { filter } from 'rxjs/operators';

@UntilDestroy()
@Directive({
  selector: '[dmIsLinkActive]',
})
export class IsLinkActiveDirective implements AfterViewInit {
  @Input() routerLink: string;
  @Input('dmIsLinkActive') activeClass: string;

  constructor(private renderer2: Renderer2, private el: ElementRef<any>, private router: Router) {
    this.router.events
      .pipe(
        untilDestroyed(this),
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe(() => this.checkLink());
  }

  ngAfterViewInit() {
    this.checkLink();
  }

  checkLink() {
    if (this.isLinkActive(this.routerLink)) {
      this.renderer2.addClass(this.el.nativeElement, this.activeClass);
    } else {
      this.renderer2.removeClass(this.el.nativeElement, this.activeClass);
    }
  }

  private isLinkActive(url) {
    const charPos = this.router.url.indexOf('?');
    const cleanUrl = charPos !== -1 ? this.router.url.slice(0, charPos) : this.router.url;
    return cleanUrl === url;
  }
}
