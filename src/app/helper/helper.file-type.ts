import { HttpEventType, HttpResponse } from "@angular/common/http";
import { FormControl } from "@angular/forms";
import { pipe, filter, map, tap } from "rxjs";

export function requiredFileType(type: string) {
    return function (control: FormControl) {
        console.log(control);
        const file = control.value;
        if (file) {
            const extension = file.name.split('.')[1].toLowerCase();
            if (type.toLowerCase() !== extension.toLowerCase() || file.type !== "application/pdf") {
                return {
                    requiredFileType: true
                };
            }
            if (file.size > 1024 * 1024) { 
                return {
                    requiredFileSize: true
                };
            }
            return null;
        }

        return null;
    };
}

export function toFormData(formValue:any) {
    const formData = new FormData();

    for (const key of Object.keys(formValue)) {
        const value = formValue[key];
        formData.append(key, value);
    }

    return formData;
}

export function toResponseBody<T>() {
    return pipe(
        filter((event: any) => event.type === HttpEventType.Response),
        map((res: HttpResponse<T>) => res.body)
    );
}

export function uploadProgress<T>(cb: (progress: number) => void) {
    return tap((event: any) => {
        if (event.type === HttpEventType.UploadProgress) {
            cb(Math.round((100 * event.loaded) / event.total));
        }
    });
}