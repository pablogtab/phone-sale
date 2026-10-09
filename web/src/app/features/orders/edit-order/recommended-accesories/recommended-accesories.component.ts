import { SharedModule } from '@/app/shared/ui/shared.module';
import { Product } from '@/app/core/models/product';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';
import { FormControl, FormsModule } from '@angular/forms';
import { ButtonModule } from '@openng/optimus-ui/button';
import { CheckboxModule } from '@openng/optimus-ui/checkbox';
import { InputNumberModule } from '@openng/optimus-ui/inputnumber';
import { TableModule } from '@openng/optimus-ui/table';

@Component({
    selector: 'app-recommended-accesories',
    imports: [
        SharedModule,
        InputNumberModule,
        CheckboxModule,
        TableModule,
        ButtonModule,
    ],
    templateUrl: './recommended-accesories.component.html',
})
export class RecommendedAccesoriesComponent {
    data: RecommendedAccesoriesComponent = inject(DIALOG_DATA);
    dialogRef = inject(DialogRef);

    options: (Product & { quantity: number; enabled: FormControl<boolean> })[] =
        [];

    addRecommendedAccesories() {
        this.dialogRef.close(
            this.options
                .filter((x) => x.enabled.value)
                .map((x) => ({ ...x, quantity: x.quantity })),
        );
    }

    cancel() {
        this.dialogRef.close();
    }

    ngOnInit(): void {
        //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        //Add 'implements OnInit' to the class.
        this.options = this.data.accesories.map((x) => ({
            ...x,
            quantity: 1,
            enabled: new FormControl(x.stock && x.stock > 0),
        }));
    }
}

export interface RecommendedAccesoriesComponent {
    accesories: Product[];
}
