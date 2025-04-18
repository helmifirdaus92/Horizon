/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ExecutionResult, GraphQLError } from 'graphql';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ConfigurationService } from '../configuration/configuration.service';

@Injectable()
export class NonAuthorizedResponseInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      tap({
        next: (ev) => {
          if (!(ev instanceof HttpResponse)) {
            return;
          }

          if (this.hasGraphQLNonAuthorizedErrors(ev)) {
            this.handleNonAuthorizedReply();
          }
        },
        error: (ev) => {
          if (!(ev instanceof HttpErrorResponse)) {
            return;
          }

          if (
            ev.status === 401 &&
            ConfigurationService.xmCloudTenant?.url &&
            ev.url?.startsWith(ConfigurationService.xmCloudTenant.url)
          ) {
            /* Unauthorized */ this.handleNonAuthorizedReply();
            return;
          }
        },
      }),
    );
  }

  private handleNonAuthorizedReply() {
    this.reloadBrowserPage();
  }

  private hasGraphQLNonAuthorizedErrors(event: HttpResponse<any>): boolean {
    if (event.status !== 200) {
      return false;
    }

    if (event.headers.get('Content-Type') !== 'application/json') {
      return false;
    }

    const response = event.body as ExecutionResult;
    if (typeof response !== 'object' || !response.data || !response.errors) {
      return false;
    }

    return (
      Array.isArray(response.errors) &&
      response.errors.some((e: GraphQLError) => !!e.extensions && e.extensions['code'] === 'NOT_AUTHORIZED')
    );
  }

  private reloadBrowserPage() {
    window.location.reload();
  }
}
