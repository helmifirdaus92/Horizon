/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { AbstractType, InjectionToken, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { GraphQLError } from 'graphql';
import { Observable, Observer } from 'rxjs';

/* NOTICE! This is a file for utils which are testing specific.
   This code is not being compiled during normal app bundling. */

/**
 * A type to be able to assign readonly fileds
 */
export type Mutable<
  T extends {
    [x: string]: any;
  },
  K extends string,
> = {
  [P in K]: T[P];
};

/**
 * Custom jasmine matcher to check whether observable has immediate value and value is equal to specified value.
 */
export function observableWithValue<T>(expectedValue: T): jasmine.AsymmetricMatcher<Observable<T>> {
  return {
    asymmetricMatch: (actual, customTesters) => {
      let actualValue: unknown;
      let hasValue = false;

      actual.subscribe((v) => {
        actualValue = v;
        hasValue = true;
      });

      if (!hasValue) {
        throw Error(`Observable doesn't have immediate value.`);
      }

      return customTesters!.equals(actualValue, expectedValue);
    },
    jasmineToString: () => `observable('${expectedValue}')`,
  };
}

export function createGqlError(message: string, code: string): GraphQLError {
  return new GraphQLError(message, undefined, undefined, undefined, undefined, undefined, { code });
}

export function createSpyObserver<T = any>(): jasmine.SpyObj<Observer<T>> {
  return jasmine.createSpyObj<Observer<T>>('spyObserver', ['next', 'complete', 'error']);
}

export function spyObservable<T>(observable: Observable<T>): jasmine.SpyObj<Observer<T>> {
  const spyObserver = createSpyObserver<T>();
  observable.subscribe(spyObserver);
  return spyObserver;
}

/**
 * TestBed.inject() alias converting result to a jasmine spy.
 */
export function TestBedInjectSpy<T>(token: Type<T> | InjectionToken<T> | AbstractType<T>): jasmine.SpyObj<T> {
  return TestBed.inject(token) as jasmine.SpyObj<T>;
}

/**
 * Valid source attr that doesn't load anything or cause console errors on the browser.
 */
export const TESTING_URL = 'http://:0/';

export function nextTick(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve));
}

export const LONG_NAME = `Lorem ipsumis simply dummy text of the printing and typesetting industry.Lorem Ipsum
                   available standard dummy.There are many variations of passages of Lorem Ipsum ,
                   There are many variations of passages of Lorem Ipsum available Lorem Ipsum,`;
