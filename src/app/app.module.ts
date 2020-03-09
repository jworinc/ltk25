import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { GlobalErrorHandler } from './error-handler';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { SnotifyModule, SnotifyService, ToastDefaults } from 'ng-snotify';

import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { EmailloginComponent } from './components/emaillogin/emaillogin.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LessonComponent } from './components/lesson/lesson.component';
import { ReportsComponent } from './components/reports/reports.component';
import { TopnavComponent } from './components/topnav/topnav.component';
import { MsmenuComponent } from './components/msmenu/msmenu.component';
import { BaseComponent } from './activities/base/base.component';
//import { CardComponent } from './components/card/card.component';
import { SettingsComponent } from './components/settings/settings.component';
import { LevelselectorComponent } from './components/levelselector/levelselector.component';
import { FeedbackComponent } from './components/feedback/feedback.component';
import { DetailReportComponent } from './components/detail-report/detail-report.component';
import { PlacementReportComponent } from './components/placement-report/placement-report.component';
import { ProgressReportComponent } from './components/progress-report/progress-report.component';
import { ShowmeReportComponent } from './components/showme-report/showme-report.component';
import { SummaryReportComponent } from './components/summary-report/summary-report.component';

import { DataloaderService } from './services/dataloader.service';
import { TokenService } from './services/token.service';
import { AuthService } from './services/auth.service';
import { BeforeLoginService } from './services/before-login.service';
import { AfterLoginService } from './services/after-login.service';
import { OptionService } from './services/option.service';
import { CardbuilderService } from './services/cardbuilder.service';
import { PlaymediaService } from './services/playmedia.service';
import { RecorderService } from './services/recorder.service';
import { BindhtmlPipe } from './pipes/bindhtml.pipe';
import { MediapreloaderService } from './services/mediapreloader.service';
import { LoggingService } from './services/logging.service';
import { ColorschemeService } from './services/colorscheme.service';
import { ErrorLogService } from './services/error-log.service';

import { CardDirective } from './directives/card.directive';
import { Al1Component } from './activities/al1/al1.component';
import { CarComponent } from './activities/car/car.component';
import { Al2Component } from './activities/al2/al2.component';
import { Ar1Component } from './activities/ar1/ar1.component';
import { Ar2Component } from './activities/ar2/ar2.component';
import { Ar3Component } from './activities/ar3/ar3.component';
import { Ar4Component } from './activities/ar4/ar4.component';
import { Ar5Component } from './activities/ar5/ar5.component';
import { Ar6Component } from './activities/ar6/ar6.component';
import { BasearComponent } from './activities/basear/basear.component';
import { BaseorComponent } from './activities/baseor/baseor.component';
import { Or1Component } from './activities/or1/or1.component';
import { Or2Component } from './activities/or2/or2.component';
import { Or3Component } from './activities/or3/or3.component';
import { Or4Component } from './activities/or4/or4.component';
import { BasebwComponent } from './activities/basebw/basebw.component';
import { Bw1Component } from './activities/bw1/bw1.component';
import { Bw2Component } from './activities/bw2/bw2.component';
import { Bw3Component } from './activities/bw3/bw3.component';
import { Bw5Component } from './activities/bw5/bw5.component';
import { Bw6Component } from './activities/bw6/bw6.component';
import { Bw7Component } from './activities/bw7/bw7.component';
import { SypComponent } from './activities/syp/syp.component';
import { DiwComponent } from './activities/diw/diw.component';
import { GscComponent } from './activities/gsc/gsc.component';
import { Rp1Component } from './activities/rp1/rp1.component';
import { Rp2Component } from './activities/rp2/rp2.component';
import { GwmComponent } from './activities/gwm/gwm.component';
import { SiwComponent } from './activities/siw/siw.component';
import { GwfComponent } from './activities/gwf/gwf.component';
import { GqwComponent } from './activities/gqw/gqw.component';
import { DisComponent } from './activities/dis/dis.component';
import { SplComponent } from './activities/spl/spl.component';
import { GdnComponent } from './activities/gdn/gdn.component';
import { GcpComponent } from './activities/gcp/gcp.component';
import { GcsComponent } from './activities/gcs/gcs.component';
import { GisComponent } from './activities/gis/gis.component';
import { GmuComponent } from './activities/gmu/gmu.component';
import { GnbComponent } from './activities/gnb/gnb.component';
import { GslComponent } from './activities/gsl/gsl.component';
import { GsmComponent } from './activities/gsm/gsm.component';
import { GssComponent } from './activities/gss/gss.component';
import { PlaywordsDirective } from './directives/playwords.directive';
import { PlaysentenceDirective } from './directives/playsentence.directive';
import { RequestInterceptor } from './interceptors/http_interceptor';
import { WarncompleteComponent } from './components/warncomplete/warncomplete.component';
import { EntranceComponent } from './components/entrance/entrance.component';
import { Rw1Component } from './activities/rw1/rw1.component';
import { IdmComponent } from './activities/idm/idm.component';
import { Wl1Component } from './activities/wl1/wl1.component';
import { Bs1Component } from './activities/bs1/bs1.component';
import { CccComponent } from './activities/ccc/ccc.component';

import { NotebookComponent } from './components/notebook/notebook.component';
import { GrammarComponent } from './components/grammar/grammar.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ShowtestingComponent } from './components/showtesting/showtesting.component';
import { AuditoryComponent } from './tests/auditory/auditory.component';
import { ComprehensionComponent } from './tests/comprehension/comprehension.component';
import { TestDirective } from './directives/test.directive';
import { BasetestComponent } from './tests/basetest/basetest.component';
import { SpellingComponent } from './tests/spelling/spelling.component';
import { TstComponent } from './activities/tst/tst.component';
import { IntroComponent } from './tests/intro/intro.component';
import { ResultsComponent } from './tests/results/results.component';
import { TestResultItemComponent } from './components/test-result-item/test-result-item.component';
import { CustomfieldService } from './services/customfield.service';
import { CfcComponent } from './activities/cfc/cfc.component';
import { SnoozeComponent } from './components/snooze/snooze.component';
import { WordtranslateDirective } from './directives/wordtranslate.directive';
import { MultiselectComponent } from './components/multiselect/multiselect.component';
import { ReversePipe } from './pipes/reverse.pipe';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    EmailloginComponent,
    DashboardComponent,
    LessonComponent,
    ReportsComponent,
    TopnavComponent,
    MsmenuComponent,
    BaseComponent,
    CardDirective,
    Al1Component,
    CarComponent,
    Al2Component,
    Ar1Component,
    Ar2Component,
    Ar3Component,
    Ar4Component,
    Ar5Component,
    Ar6Component,
    BasearComponent,
    BaseorComponent,
    Or1Component,
    Or2Component,
    Or3Component,
    Or4Component,
    BasebwComponent,
    Bw1Component,
    Bw2Component,
    Bw3Component,
    Bw5Component,
    Bw6Component,
    Bw7Component,
    SypComponent,
    DiwComponent,
    GscComponent,
    Rp1Component,
    Rp2Component,
    GwmComponent,
    SiwComponent,
    GwfComponent,
    GqwComponent,
    DisComponent,
    SplComponent,
    GdnComponent,
    GcpComponent,
    GcsComponent,
    GisComponent,
    GmuComponent,
    GnbComponent,
    GslComponent,
    GsmComponent,
    GssComponent,
    BindhtmlPipe,
    PlaywordsDirective,
    PlaysentenceDirective,
    LevelselectorComponent,
    SettingsComponent,
    FeedbackComponent,
    DetailReportComponent,
    PlacementReportComponent,
    ProgressReportComponent,
    ShowmeReportComponent,
    SummaryReportComponent,
    WarncompleteComponent,
    EntranceComponent,
    Rw1Component,
    IdmComponent,
    Wl1Component,
    Bs1Component,
    CccComponent,
    NotebookComponent,
    GrammarComponent,
    BasetestComponent,
    ShowtestingComponent,
    AuditoryComponent,
    ComprehensionComponent,
    TestDirective,
    SpellingComponent,
    TstComponent,
    IntroComponent,
    ResultsComponent,
    TestResultItemComponent,
    CfcComponent,
    SnoozeComponent,
    WordtranslateDirective,
    MultiselectComponent,
    ReversePipe,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    SnotifyModule,
    TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
  ],
  providers: [DataloaderService, TokenService, AuthService, BeforeLoginService, AfterLoginService,
  { provide: 'SnotifyToastConfig', useValue: ToastDefaults },
    SnotifyService, OptionService, CardbuilderService, PlaymediaService, RecorderService, MediapreloaderService, 
    LoggingService, ColorschemeService, CustomfieldService, ErrorLogService, Title,
    { provide: HTTP_INTERCEPTORS, useClass: RequestInterceptor, multi: true },
    /*{ provide: ErrorHandler, useClass: GlobalErrorHandler }*/ ],
    //{ provide: ErrorHandler, useClass: GlobalErrorHandler }],
  entryComponents: [ Al1Component, CarComponent, Al2Component, Ar1Component, Ar2Component, Ar3Component, Ar4Component, Ar5Component,
  Ar6Component, Or1Component, Or2Component, Or3Component, Or4Component, Bw1Component, Bw2Component, Bw3Component, Bw5Component,
  Bw6Component, Bw7Component, SypComponent, DiwComponent, GscComponent, Rp1Component, Rp2Component, GwmComponent, SiwComponent,
  GwfComponent, GqwComponent, DisComponent, SplComponent, GdnComponent, GcpComponent, GcsComponent, GisComponent, GmuComponent,
  GnbComponent, GslComponent, GsmComponent, GssComponent, Rw1Component, IdmComponent, Wl1Component, Bs1Component, AuditoryComponent,
  ComprehensionComponent, SpellingComponent, CccComponent, TstComponent, IntroComponent, ResultsComponent, CfcComponent ],
  bootstrap: [AppComponent]
})
export class AppModule { }
