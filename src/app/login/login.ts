import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // <-- import CommonModule
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { RxLogin } from '../_shared/model/reactive/rx-login';
import { AuthService } from '../_shared/service/auth-service';
import { Router } from '@angular/router';

type AuthView = 'login' | 'forgot' | 'otp' | 'reset';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  standalone: true,
  templateUrl: './login.html',
  styleUrl: './login.css'
})

export class Login {
  rxform!: FormGroup<RxLogin>
  isLoading = false
  errorMessage = ''; 

  view: AuthView = 'login';

  // forgot flow state
  forgotUser = '';
  otpCode = '';
  newPassword = '';

  constructor(
    private readonly authService: AuthService,
    private readonly fb: FormBuilder,
    private readonly router: Router,
  ) {}

  ngOnInit() {
    this.rxform = this.fb.nonNullable.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    })

    this.authService.currentUser$.subscribe({
      next: (u) => {
        if (u) {
          this.router.navigate(['/dashboard'])
        }
      }
    })
  }

  // ===== LOGIN =====
  onSubmit() {
    this.isLoading = true
    this.errorMessage = ''; // reset error
    this.authService.login(this.username.value, this.password.value).subscribe({
      next: (r) => {
          this.authService['currentUserSubject'].next(r.user);
          this.router.navigate(['/dashboard'])
      },
      error: (err) => {
        alert(err.error.message);
        // Display a friendly error message
        this.errorMessage = 'Invalid username or password';
      }    }).add(() => this.isLoading = false)
  }

    // ===== FORGOT FLOW =====
  sendOtp() {
    this.isLoading = true
    this.authService.forgotPassword(this.forgotUser).subscribe({
      next: (res) => {
        // API call succeeded
        this.view = 'otp'; // switch to OTP input view
        this.isLoading = false;
      },
      error: (err) => {
        // handle error nicely
        alert(err.error.message);
        this.isLoading = false;
      }
    });
  }

  verifyOtp() {
    this.authService.verifyOtp(this.forgotUser, this.otpCode).subscribe(() => {
      this.view = 'reset';
    });
  }

  resetPassword() {
    this.authService.resetPassword(this.forgotUser, this.newPassword)
      .subscribe(() => {
        alert('Password updated');
        this.view = 'login';
      });
  }

  get username() { return this.rxform.controls.username; }
  get password() { return this.rxform.controls.password; }
  

  onForgotPassword() {

    this.router.navigate(['/auth/forgot-password']);
  }
}
