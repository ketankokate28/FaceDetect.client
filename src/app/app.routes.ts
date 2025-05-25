// ---------------------------------------
// Email: xyz@pqr.com
// Templates: /templates
// (c) 2024 /mit-license
// ---------------------------------------

import { Routes } from '@angular/router';
import { AuthGuard } from './services/auth-guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent),
    canActivate: [AuthGuard],
    title: 'Home'
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent),
    title: 'Login'
  },
    {
    path: 'policestation',
    loadComponent: () => import('./components/policestation/policestation.component').then(m => m.PolicestationComponent),
    canActivate: [AuthGuard],
    title: 'Police Station'
  },
  {
    path: 'cctv',
    loadComponent: () => import('./components/cctv/cctv.component').then(m => m.CCTVComponent),
    canActivate: [AuthGuard],
    title: 'CCTV'
  },
  {
    path: 'suspect',
    loadComponent: () => import('./components/suspect/suspect.component').then(m => m.SuspectComponent),
    canActivate: [AuthGuard],
    title: 'Suspect'
  },
  {
    path: 'notifications',
    loadComponent: () => import('./components/notification/notification-page-view.component').then(m => m.NotificationPageViewComponent),
    canActivate: [AuthGuard],
    title: 'Notifications'
  },
   {
    path: 'facematch',
    loadComponent: () => import('./components/facematch/matchfacelog-summary.component').then(m => m.MatchFaceLogSummaryComponent),
    canActivate: [AuthGuard],
    title: 'FaceMatch'
  },
  // {
  //   path: 'admin',
  //   loadComponent: () => import('./components/admin/admin.component').then(m => m.AdminComponent),
  //   canActivate: [AuthGuard],
  //   title: 'Admin'
  // },
  {
    path: 'admin',
    loadComponent: () => import('./components/settings/settings.component').then(m => m.SettingsComponent),
    canActivate: [AuthGuard],
    title: 'Admin'
  },
  {
    path: 'settings',
    loadComponent: () => import('./components/settings/settings.component').then(m => m.SettingsComponent),
    canActivate: [AuthGuard],
    title: 'Settings'
  },
  {
    path: 'about',
    loadComponent: () => import('./components/about/about.component').then(m => m.AboutComponent),
    title: 'About Us'
  },
  {
    path: 'home',
    redirectTo: '/',
    pathMatch: 'full'
  },
  {
    path: '**',
    loadComponent: () => import('./components/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: 'Page Not Found'
  }
];
