import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RxLogin } from '../_shared/model/reactive/rx-login';
import { AuthService } from '../_shared/service/auth-service';
import { Router } from '@angular/router';

// Angular Material modules
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  rxform!: FormGroup<RxLogin>;
  isLoading = false;
  hidePassword = true;

  constructor(
    private readonly authService: AuthService,
    private readonly fb: FormBuilder,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.rxform = this.fb.nonNullable.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });

    this.authService.currentUser$.subscribe({
      next: (u) => {
        if (u) this.router.navigate(['/dashboard']);
      }
    });
  }

  onSubmit() {
    if (this.rxform.invalid) return;
    this.isLoading = true;

    this.authService.login(this.username.value, this.password.value).subscribe({
      next: (res) => {
        // Set the user for guards and UI
        this.authService['currentUserSubject'].next(res.user);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => console.error(err)
    });
  }

  get username() {
    return this.rxform.controls.username;
  }

  get password() {
    return this.rxform.controls.password;
  }
}
