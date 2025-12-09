import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // <-- import CommonModule
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RxLogin } from '../_shared/model/reactive/rx-login';
import { AuthService } from '../_shared/service/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule],
  standalone: true,
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  rxform!: FormGroup<RxLogin>
  isLoading = false
  errorMessage = ''; 

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

  onSubmit() {
    this.isLoading = true
    this.errorMessage = ''; // reset error
    this.authService.login(this.username.value, this.password.value).subscribe({
      next: (r) => {
          this.authService['currentUserSubject'].next(r.user);
          this.router.navigate(['/dashboard'])
      },
      error: (err) => {
        console.error(err);
        // Display a friendly error message
        this.errorMessage = 'Invalid username or password';
      }    }).add(() => this.isLoading = false)
  }

  get username () {
    return this.rxform.controls.username
  }

  get password () {
    return this.rxform.controls.password
  }
}
