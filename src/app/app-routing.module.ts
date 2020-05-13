import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { EntranceComponent } from './components/entrance/entrance.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LessonComponent } from './components/lesson/lesson.component';
import { ReportsComponent } from './components/reports/reports.component';

import { BeforeLoginService } from './services/before-login.service';
import { AfterLoginService } from './services/after-login.service';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [BeforeLoginService],
  },
  {
    path: 'entrance/:l',
    component: EntranceComponent,
    canActivate: [BeforeLoginService],
  },
  {
    path: 'home',
    component: DashboardComponent,
    canActivate: [AfterLoginService],
  },
  {
    path: 'lesson',
    component: LessonComponent,
    canActivate: [AfterLoginService],
  },
  {
    path: 'sidetrip/:n',
    component: LessonComponent,
    canActivate: [AfterLoginService],
  },
  {
    path: 'next/:n',
    component: LessonComponent,
    canActivate: [AfterLoginService],
  },
  {
    path: 'reports',
    component: ReportsComponent,
    canActivate: [AfterLoginService],
  },
  { path: '',   redirectTo: '/home', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
