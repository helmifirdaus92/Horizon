/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}

// A trick to import JSON files.
// See more detail here: https://github.com/aurelia/cli/issues/493#issuecomment-281916899
declare module '*.json' {
  const value: any;
  export default value;
}
