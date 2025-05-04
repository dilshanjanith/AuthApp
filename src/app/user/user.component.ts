import { Component } from '@angular/core';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';

@Component({
  selector: 'app-user',
  imports: [LoginComponent, RegistrationComponent],
  templateUrl: './user.component.html',
  styles: ``,
})
export class UserComponent {}
