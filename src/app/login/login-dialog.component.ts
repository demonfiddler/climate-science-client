import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ClimateScienceService } from '../shared/climate-science.service';

/**
 * Component that renders a login form and requests authentication upon form submit.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatDialogModule
  ],
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.css']
})
export class LoginDialogComponent {

  form: FormGroup;
  dialogRef: MatDialogRef<LoginDialogComponent>;
  message: string;

  /**
   * 
   * @param fb A FormBuilder instance.
   * @param authService The authentication service.
   */
  constructor(private fb: FormBuilder, private authService: ClimateScienceService) {
    this.form = this.fb.group({
      userId: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  /**
   * Attempts to authenticate using the supplied credentials.
   */
  login() : void {
    const credentials = this.form.value;
    if (credentials.userId && credentials.password) {
      this.message = "Logging in...";
      this.authService.login(credentials.userId, credentials.password)
        .subscribe(
          (success) => {
            if (success)
              this.dialogRef.close();
            else
              this.message = "Incorrect User ID or password";
          }
        );
    }
  }

}
