import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RxLogin } from '../_shared/model/reactive/rx-login';
import { AuthService } from '../_shared/service/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  rxform!: FormGroup<RxLogin>
  isLoading = false

  constructor(
    private readonly authService: AuthService,
    private readonly fb: FormBuilder,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
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

    this.authService.login(this.username.value, this.password.value).subscribe({
      next: (r) => {
        this.router.navigate(['/dashboard'])
      },
      error: (err) => alert(`Something went wrong ${err}`)
    }).add(() => this.isLoading = false)
  }

  get username () {
    return this.rxform.controls.username
  }

  get password() {
    return this.rxform.controls.password
  }
}
