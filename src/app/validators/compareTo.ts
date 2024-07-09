import {AbstractControl, ValidatorFn} from '@angular/forms';

export function compareToValidator(control_id_to_compare_to: string):ValidatorFn{
    return (control:AbstractControl):{[key: string]: boolean} | null =>{ 
        const controlValue:string = control.value;
        const valueToCompare:string = control.parent?.get(control_id_to_compare_to)?.value;

        if(valueToCompare === controlValue){
            return null;
        }else{
            return {'compareTo':false};
        }
    };
};
