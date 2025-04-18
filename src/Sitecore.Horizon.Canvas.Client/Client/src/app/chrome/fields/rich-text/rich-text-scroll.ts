/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/* eslint-disable */

import Quill from 'quill';

const Scroll = Quill.import('blots/scroll');
const Parchment = Quill.import('parchment');

// Override quill/blots/scroll.js
// Fix issues when Quill crashes with exception " Cannot read properties of undefined (reading 'mutations')"
// https://sitecore.atlassian.net/browse/PGS-1932
// https://github.com/decidim/decidim/pull/7999

// All the code is copied from Quill and Parchment. To resolve ESlint issues without refactoring some type overwrites are added.
export class ScrollOverride extends Scroll {
  optimize(mutations = [], context = {}) {
    if (this.batch === true) {
      return;
    }

    this.parchmentOptimize(mutations, context);

    if (mutations.length > 0) {
      // quill/core/emitter.js, Emitter.events.SCROLL_OPTIMIZE = "scroll-optimize"
      this.emitter.emit('scroll-optimize', mutations, context);
    }
  }

  // Override parchment/src/blot/scroll.ts
  parchmentOptimize(mutations: any = [], context = {}) {
    // super.optimize(context);
    Reflect.apply(Parchment.Container.prototype.optimize, this, [context]);

    // We must modify mutations directly, cannot make copy and then modify
    // let records = [].slice.call(this.observer.takeRecords());
    let records = [...this.observer.takeRecords()];
    // Array.push currently seems to be implemented by a non-tail recursive function
    // so we cannot just mutations.push.apply(mutations, this.observer.takeRecords());
    while (records.length > 0) {
      mutations.push(records.pop());
    }
    let mark: any = (blot: any, markParent: any) => {
      if (!blot || blot === this) {
        return;
      }
      if (!blot.domNode.parentNode) {
        return;
      }
      if (blot.domNode.__blot && blot.domNode.__blot.mutations === null) {
        blot.domNode.__blot.mutations = [];
      }
      if (markParent) {
        mark(blot.parent);
      }
    };
    let optimize: any = (blot: any) => {
      // Post-order traversal
      if (!blot.domNode.__blot) {
        return;
      }

      if (blot instanceof Parchment.Container) {
        blot.children.forEach(optimize);
      }
      blot.optimize(context);
    };
    let remaining = mutations;
    for (let ind = 0; remaining.length > 0; ind += 1) {
      // MAX_OPTIMIZE_ITERATIONS = 100
      if (ind >= 100) {
        throw new Error('[Parchment] Maximum optimize iterations reached');
      }
      remaining.forEach((mutation: any) => {
        let blot = Parchment.find(mutation.target, true);
        if (!blot) {
          return;
        }
        if (blot.domNode === mutation.target) {
          if (mutation.type === 'childList') {
            mark(Parchment.find(mutation.previousSibling, false));

            mutation.addedNodes.forEach((node: any) => {
              let child = Parchment.find(node, false);
              mark(child, false);
              if (child instanceof Parchment.Container) {
                child.children.forEach(function (grandChild: any) {
                  mark(grandChild, false);
                });
              }
            });
          } else if (mutation.type === 'attributes') {
            mark(blot.prev);
          }
        }
        mark(blot);
      });
      this.children.forEach(optimize);
      remaining = [...this.observer.takeRecords()];
      records = remaining.slice();
      while (records.length > 0) {
        mutations.push(records.pop());
      }
    }
  }
}
