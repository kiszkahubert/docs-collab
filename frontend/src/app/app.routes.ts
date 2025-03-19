import { Routes } from '@angular/router';
import {RegisterComponent} from './auth/register/register.component';
import {LoginComponent} from './auth/login/login.component';
import {MainPageCombinedComponent} from './mainPage/main-page-combined/main-page-combined.component';
import {DocumentComponent} from './document/document.component';

export const routes: Routes = [
  { path: '', component: MainPageCombinedComponent},
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'document', component: DocumentComponent}
];
