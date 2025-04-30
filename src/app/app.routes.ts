import { Routes } from '@angular/router';
import { LoginComponent } from './Pages/employee-data/login/login.component';
import { HomeComponent } from './Pages/employee-data/home/home.component';
import { UserListComponent } from './Pages/employee-data/user-list/user-list.component';

export const routes: Routes = [
    {
        path:'',
        redirectTo:'login',
        pathMatch:'full'
    },
    {
        path:'login',
        component:LoginComponent
    },
    {
        path:'',
        component:HomeComponent,
        children:[
            {
                path:'user-list',
                component:UserListComponent
            }
        ]
    }
];
