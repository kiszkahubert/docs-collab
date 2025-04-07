import { Routes } from '@angular/router';
import {RegisterComponent} from './auth/register/register.component';
import {LoginComponent} from './auth/login/login.component';
import {MainPageCombinedComponent} from './mainPage/main-page-combined/main-page-combined.component';
import {DocumentComponent} from './document/document.component';
import {AuthGuard} from './services/auth.guard';
import {SaveProgressGuard} from './services/save-progress.guard';

export const routes: Routes = [
  { path: '', component: MainPageCombinedComponent, canActivate: [AuthGuard]},
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent},
  { path: 'document', component: DocumentComponent,canActivate: [AuthGuard]},
  { path: 'document/:id', component: DocumentComponent,canActivate: [AuthGuard], canDeactivate: [SaveProgressGuard]}
];
