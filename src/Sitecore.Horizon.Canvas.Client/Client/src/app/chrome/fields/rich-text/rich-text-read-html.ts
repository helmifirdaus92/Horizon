/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import Quill from 'quill';

export function readEditorHTML(quill: Quill): string {
  return isFieldEmpty(quill.root) ? '' : quill.root.innerHTML;
}

function isFieldEmpty(htmlElement: HTMLDivElement): boolean {
  // When Quill is empty, there is still a blank line represented by '\n'
  return (htmlElement.innerText === '' || htmlElement.innerText === '\n') && !hasChildImageHtmlElement(htmlElement);
}

function hasChildImageHtmlElement(htmlElement: HTMLDivElement) {
  return htmlElement.querySelector('img');
}
