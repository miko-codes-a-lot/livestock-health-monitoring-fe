import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

import { AuthService } from '../../_shared/service/auth-service';
import { UserService } from '../../_shared/service/user-service';
import { UserDto } from '../../_shared/model/user-dto';

@Component({
  selector: 'app-user-settings-index',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    RouterLink,
    MatDialogModule,
  ],
  templateUrl: './user-settings-index.html',
  styleUrl: './user-settings-index.css',
})
export class UserSettingsIndex implements OnInit {
  @ViewChild('avatarModal') avatarModal!: TemplateRef<any>;
  user!: UserDto;
  avatarUrl: string | null = null;
  selectedFile: File | null = null;
  isLoading = false;

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly router: Router,
    private readonly dialog: MatDialog,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe({
      next: (user) => {
        if (user) {
          this.user = user;
          // if (user.profilePicture) this.loadProfilePicture(user._id!);
        }
      },
    });
  }

  /** Opens the avatar upload modal */
  openAvatarModal(): void {
    this.dialog.open(this.avatarModal, {
      width: '400px',
      panelClass: 'avatar-dialog',
    });
  }

  closeAvatarModal(): void {
    this.dialog.closeAll();
    this.selectedFile = null;
  }

  /** Loads the user's actual avatar image from backend */
  loadProfilePicture(userId: string): void {
    // this.userService.getProfilePicture(userId).subscribe({
    //   next: (url) => {
    //     this.avatarUrl = url;
    //     this.cdr.detectChanges();
    //   },
    //   error: () => (this.avatarUrl = null),
    // });
  }

  /** Preview and select avatar file */
  onAvatarChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.avatarUrl = reader.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  /** Upload the selected avatar to the backend */
  onUpload(): void {
    if (!this.selectedFile || !this.user?._id) return;
    this.isLoading = true;

    // this.userService.uploadProfilePicture(this.user._id, this.selectedFile).subscribe({
    //   next: () => {
    //     alert('✅ Profile picture updated successfully!');
    //     this.closeAvatarModal();
    //     this.isLoading = false;
    //   },
    //   error: (err) => {
    //     console.error('Upload failed', err);
    //     alert('❌ Failed to upload profile picture.');
    //     this.isLoading = false;
    //   },
    // });
  }

  /** Redirects to edit page */
  editUser(): void {
    this.router.navigate(['/user-settings/update']);
  }

  /** Logs out the user */
  logout(): void {
    this.isLoading = true;
    this.authService
      .logout()
      .subscribe({
        next: () => this.router.navigate(['/login']),
        error: (err) => alert(`Logout failed: ${err}`),
      })
      .add(() => (this.isLoading = false));
  }
}
