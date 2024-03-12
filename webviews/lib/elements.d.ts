import { JSX } from 'solid-js';

type VSCode = {
  postMessage(message: any): void;
  getState(): any;
  setState(state: any): void;
};

declare const vscode: VSCode;

declare module "solid-js" {
  namespace JSX {
    interface IntrinsicElements {
      "vscode-text-field": any;
    }
  }
}
