import { Routes } from '@angular/router';
import { LoginComponent } from './Pages/employee-data/login/login.component';
import { HomeComponent } from './Pages/employee-data/home/home.component';
import { UserListComponent } from './Pages/employee-data/user-list/user-list.component';
import { ReportComponent } from './Pages/employee-data/report/report.component';
import { HospitalizationComponent } from './Pages/employee-data/hospitalization/hospitalization.component';
import { PrescriptionComponent } from './Pages/employee-data/prescription/prescription.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: '',
        component: HomeComponent,
        children: [
            { path: '', redirectTo: 'user-list', pathMatch: 'full' }, // default
            { path: 'user-list', component: UserListComponent },
            { path: 'report', component: ReportComponent },
            { path: 'hospitalization', component: HospitalizationComponent },
            { path: 'prescription', component: PrescriptionComponent }
        ]
    },


];
