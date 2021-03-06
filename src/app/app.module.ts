import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// ROUTES
import { AppRoutingModule } from './app-routing.module';

// SOCKET.IO 
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';

// ENV
import { environment } from '../environments/environment';

// CONF
const config: SocketIoConfig = { url: environment.api, options: {} };


// COMPONENTS
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { HomeComponent } from './pages/home/home.component';
import { ContactComponent } from './pages/contact/contact.component';
import { NopagefoundComponent } from './pages/nopagefound/nopagefound.component';

// MODULES
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MaterialModule } from './modules/material.module';
import { ComponentsModule } from './components/components.module';

// GUARDS
import { AdminGuard } from './guards/admin.guard';
import { TokenGuard } from './guards/token.guard';
import { LoginGuard } from './guards/login.guard';

import { MAT_DATE_LOCALE } from '@angular/material/core';
import { HowWorksComponent } from './pages/how-works/how-works.component';
import { PricingComponent } from './pages/pricing/pricing.component';
import { TokenService } from './interceptors/token.service';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { FooterComponent } from './pages/home/footer/footer.component';
import { VideoComponent } from './pages/video/video.component';
import { HashLocationStrategy, LocationStrategy, PathLocationStrategy } from '@angular/common';

@NgModule({
	declarations: [
		AppComponent,
		HomeComponent,
		RegisterComponent,
		LoginComponent,
		NopagefoundComponent,
		ContactComponent,
		HowWorksComponent,
		PricingComponent,
		FooterComponent,
		VideoComponent
	],
	imports: [
		MaterialModule,
		ComponentsModule,
		BrowserAnimationsModule,
		FormsModule,
		ReactiveFormsModule,
		HttpClientModule,
		AppRoutingModule,
		PipesModule,
		SocketIoModule.forRoot(config)
	],
	exports: [],
	providers: [
		AdminGuard,
		TokenGuard,
		LoginGuard,
		{ provide: LocationStrategy, useClass: PathLocationStrategy },
		{ provide: HTTP_INTERCEPTORS, useClass: TokenService, multi: true }, // para que este a la escucha de TODAS las peticiones
		{ provide: MAT_DATE_LOCALE, useValue: 'es' }
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
