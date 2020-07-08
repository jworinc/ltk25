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
<<<<<<< HEAD
=======
    path: 'pcm/:code',
    component: StartComponent,
    canActivate: [BeforeLoginService],
  },
  {
    path: 'pcm/:code/:e',
    component: StartComponent,
    canActivate: [BeforeLoginService],
  },
  {
    path: 'pcm/:code/:e/:n',
    component: StartComponent,
    canActivate: [BeforeLoginService],
  },
  {
    path: 'test/:type',
    component: StartComponent,
    canActivate: [BeforeLoginService],
  },
  {
    path: 'test/:type/:e',
    component: StartComponent,
    canActivate: [BeforeLoginService],
  },
  {
    path: 'test/:type/:e/:n',
    component: StartComponent,
    canActivate: [BeforeLoginService],
  },
  {
    path: 'test-code/:code/:type',
    component: StartComponent,
    canActivate: [BeforeLoginService],
  },
  {
    path: 'test-code/:code/:type/:e',
    component: StartComponent,
    canActivate: [BeforeLoginService],
  },
  {
    path: 'test-code/:code/:type/:e/:n',
    component: StartComponent,
    canActivate: [BeforeLoginService],
  },
  {
>>>>>>> 1b61e38... Test changes, routes, customizations, democodes, results
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
