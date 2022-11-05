import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { requiredFileType, toFormData, toResponseBody, uploadProgress } from './helper/helper.file-type';
import { take } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'netcracker-frontend';
  progress: any = 0;
  uploadFile: FormGroup = new FormGroup({
    fileName: new FormControl(null, [Validators.required]),
    file: new FormControl(null, [Validators.required, requiredFileType('pdf')])
  });

  percentDone: number = 0;
  formValid: boolean = false;
  showLoader: boolean = false;
  files: any;

  constructor(private http: HttpClient, private _snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.uploadFile.valueChanges.subscribe((data) => {
      console.log(this.uploadFile);
      const error = this.uploadFile.controls['file'].errors;
      if (error != null && (error['requiredFileSize'] != undefined || error['requiredFileType'] != undefined)) {
        this.openSnackBar("File Size is > 1 MB or  non pdf file", 'OK', false);
      }
      this.formValid = this.uploadFile.status == 'VALID' ? true : false;
    })

    this.getAllFiles();
  }


  submit() {
    this.showLoader = true;
    this.http.post(' https://netcracker-sb.herokuapp.com/api/upload', toFormData(this.uploadFile.value), {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      uploadProgress(progress => (this.percentDone = progress)),
      toResponseBody(),
    ).subscribe(
      (event: any) => {
        this.getAllFiles()
        this.showLoader = false;
        console.log(event);
        this.openSnackBar("File Uploaded Successfully", 'OK', true);
      },
      (err) => {
        this.showLoader = false;
        this.openSnackBar(err.message, 'OK', false);
        console.log(err);
      }
    );


  }

  openSnackBar(message: string, action: string, success: boolean) {
    let config: MatSnackBarConfig = new MatSnackBarConfig();
    config.duration = 2000;
    config.verticalPosition = "top";
    config.horizontalPosition = "right";
    config.panelClass = success ? ["green-snackbar"] : ['red-snackbar'],
      this._snackBar.open(message, action, config);
  }


  getAllFiles() {
    this.http.get("https://netcracker-sb.herokuapp.com/api/list").pipe(
      take(1)
    ).subscribe((resp: any) => {
      console.log(resp);
      if (resp.status == 200) {
        this.files = resp.data;
      }
    })
  }
}
