import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBarComponent } from './navigation/nav-bar.component';

@Component({
    selector: 'app-shell',
    imports: [NavBarComponent, RouterOutlet],
    templateUrl: './shell.component.html',
    styleUrl: './shell.component.css',
})
export class ShellComponent {}
