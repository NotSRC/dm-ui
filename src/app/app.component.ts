import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'dm-ui';
  form = new FormGroup({
    title: new FormControl('<b>ba</b>', [Validators.required]),
  });

  reset() {
    this.form.get('title').disable();
    // this.form.reset();
  }

  uploadFile(event) {
    console.log(event);
  }
}
