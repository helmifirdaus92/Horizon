/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AnalyticsComponent } from 'app/analytics/analytics.component';
import { EditorComponent } from 'app/editor/editor.component';
import { FeatureFlagsRouteGuard } from 'app/feature-flags/feature-flags-route.guard';
import { PageBranchesComponent } from 'app/page-design/page-branches/page-branches.component';
import { PageDesignsComponent } from 'app/page-design/page-designs/page-designs.component';
import { PageTemplatesComponent } from 'app/page-design/page-templates/page-templates.component';
import { PartialDesignsComponent } from 'app/page-design/partial-designs/partial-designs.component';
import { TemplatesViewComponent } from 'app/page-design/templates-view/templates-view.component';

const pagesRoutes: Routes = [
  {
    path: 'editor',
    data: { state: 'editor', reuse: true, renderSitePagesOnly: true },
    component: EditorComponent,
  },
  {
    path: 'personalization',
    data: { state: 'editor', reuse: true, renderSitePagesOnly: true },
    component: EditorComponent,
  },
  {
    path: 'analytics',
    data: { state: 'analytics', reuse: false },
    component: AnalyticsComponent,
  },
  {
    path: 'templates',
    data: { state: 'templates', reuse: false },
    component: TemplatesViewComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'pagetemplates',
      },
      {
        path: 'partialdesigns',
        data: { state: 'partialdesigns', reuse: false },
        component: PartialDesignsComponent,
      },
      {
        path: 'pagedesigns',
        data: { state: 'pagedesigns', reuse: false },
        component: PageDesignsComponent,
      },
      {
        path: 'pagebranches',
        canActivate: [FeatureFlagsRouteGuard],
        data: { state: 'pagebranches', reuse: false, featureFlag: 'pages_show-page-branches' },
        component: PageBranchesComponent,
      },
      {
        path: 'pagetemplates',
        pathMatch: 'full',
        data: { state: 'pagetemplates', reuse: false },
        component: PageTemplatesComponent,
      },
    ],
  },
  {
    path: 'editpartialdesign',
    data: { state: 'editor', reuse: false },
    component: EditorComponent,
  },
  {
    path: 'editpagedesign',
    data: { state: 'editor', reuse: false },
    component: EditorComponent,
  },
  {
    path: 'editpagebranch',
    data: { state: 'editor', reuse: false },
    component: EditorComponent,
  },
  // redirectTo relative path to preserve query params
  // https://github.com/angular/angular/issues/13315#issuecomment-427254639
  { path: '', redirectTo: 'editor', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(pagesRoutes)],
  exports: [RouterModule],
  providers: [FeatureFlagsRouteGuard],
})
export class PagesRoutingModule {}
