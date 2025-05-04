import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { FirstKeyPipe } from '../../shared/pipes/first-key.pipe';
import { AuthService } from '../../shared/services/auth.service';
import { ToastrService } from 'ngx-toastr';
interface User {
  email: string;
  password: string;
  fullName: string;
}
@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FirstKeyPipe],
  templateUrl: './registration.component.html',
  styles: ``,
})
export class RegistrationComponent {
  form: FormGroup;
  hasSubmitted = false;

  constructor(
    private fb: FormBuilder,
    private service: AuthService,
    private toastr: ToastrService
  ) {
    this.form = this.fb.group(
      {
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(12),
            Validators.pattern(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,12}$/
            ),
          ],
        ],
        confirmPassword: [''],
      },
      { validators: this.passwordMapValidator }
    );
  }

  passwordMapValidator: ValidatorFn = (
    control: AbstractControl
  ): { [key: string]: any } | null => {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (!confirmPassword && control.get('confirmPassword')?.touched) {
      return { confirmPasswordRequired: true };
    }

    if (password !== confirmPassword) {
      return { passwordMismatch: true };
    }

    return null;
  };

  onSubmit() {
    this.hasSubmitted = true;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.form.valid) {
      const formdata = {
        email: this.form.value.email,
        password: this.form.value.password,
        fullName: `${this.form.value.firstName} ${this.form.value.lastName}`,
      };

      this.service.CreateUser(formdata).subscribe({
        next: (res: any) => {
          if (res.succeeded) {
            console.log(res);
            this.form.reset();
            this.form.markAsPristine();
            this.hasSubmitted = false;
            this.toastr.success('New User Created', 'Registration successful!');
          }
        },
        error: (err) => {
          if (err.error) {
            err.error.forEach((x: any) => {
              switch (x.code) {
                case 'DuplicateUserName':
                  this.toastr.error(
                    'Username is already taken',
                    'Registration failed!'
                  );
                  break;
                case 'DuplicateEmail':
                  this.toastr.error(
                    'Email is already taken',
                    'Registration failed!'
                  );
                  break;
                default:
                  this.toastr.error(
                    'Registration failed!',
                    'Registration failed!'
                  );
                  break;
              }
            });
          }
        },
      });
    }
  }

  getValidationErrors(control: string): boolean {
    const formControl = this.form.get(control);
    if (!formControl) {
      return false;
    }
    return Boolean(
      this.form.get(control)?.errors &&
        (formControl?.touched || this.hasSubmitted || formControl?.dirty)
    );
  }
}
