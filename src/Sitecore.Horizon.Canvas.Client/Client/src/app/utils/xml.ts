/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

export function escapeXml(unsafe: string) {
  return unsafe.replace(/[<>&'"]/g, (c: string): string => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case "'":
        return '&apos;';
      case '"':
        return '&quot;';
    }

    return c;
  });
}

export function parseXmlElement(xml: string): Record<string, string | undefined> {
  const xElement = new DOMParser().parseFromString(xml, 'text/xml').firstElementChild;
  if (xElement === null) {
    return {};
  }

  return xElement.getAttributeNames().reduce(
    (memo, attrName) => {
      memo[attrName] = xElement.getAttribute(attrName) ?? undefined;
      return memo;
    },
    {} as Record<string, string | undefined>,
  );
}

export function buildXmlElement(elementName: string, attributes: Record<string, string | undefined>): string {
  const doc = document.implementation.createDocument(null, elementName, null);

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, ,
  const xElement = doc.firstElementChild!;

  for (const attrName in attributes) {
    if (Object.prototype.hasOwnProperty.call(attributes, attrName)) {
      const value = attributes[attrName];
      if (value !== undefined) {
        xElement.setAttribute(attrName, value);
      }
    }
  }

  return new XMLSerializer().serializeToString(xElement);
}
