import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'dm-ui';
  date = (new Date()).toUTCString();

  text = new FormControl('asd');

  constructor() {
    setTimeout(() => {
      this.reset();
    }, 2000);
  }

  reset() {
    this.text.reset();
  }
}
