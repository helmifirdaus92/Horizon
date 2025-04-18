// Allows imports of .scss files as an object
declare module '*.scss' {
  const content: { [className: string]: string };
  export = content;
}

// Extends AddEventListenerOptions interface
interface AddEventListenerOptions {
  signal: AbortSignal;
}
