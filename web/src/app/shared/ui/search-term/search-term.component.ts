import { CommonModule } from '@angular/common';
import { Component, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';

@Component({
    selector: 'search-term',
    imports: [CommonModule, ReactiveFormsModule, IconComponent],
    templateUrl: './search-term.component.html',
    styleUrl: './search-term.component.css',
})
export class SearchTermComponent {
    searchTerm = new FormControl('');

    //delaying the search 300ms after the user stops typing
    @Output() onSearch = this.searchTerm.valueChanges.pipe(map(value => (value || "").trim()), debounceTime(250), distinctUntilChanged());
}
