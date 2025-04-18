/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

export interface ScriptProps {
  src?: string;
  code?: string;
  id?: string;
}

export function injectScript({ src, code, id = '' }: ScriptProps) {
  if (!code && !src) {
    return;
  }

  const existingScript = document.getElementById(id);
  if (existingScript) {
    return;
  }

  const script = document.createElement('script');
  if (src) {
    script.src = src;
    script.async = true;
  } else if (code) {
    script.innerHTML = code;
  }
  script.id = id;
  document.head.appendChild(script);
}

export function removeScript(id: string): void {
  const scriptElement = document.getElementById(id);
  if (scriptElement) {
    document.head.removeChild(scriptElement);
  }
}
