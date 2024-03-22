import { StateValue } from '@aws-sdk/client-cloudwatch';
import { inject, injectable } from 'inversify';
import { BehaviorSubject } from 'rxjs';
import * as vscode from 'vscode';

import { EXTENSION_URI } from '../constants/extension-uri';
import { AlarmsService } from './alarms.service';
import { CloudWatchAlarmsPerProfile } from './cloud-watch-alarm';

@injectable()
export class SidebarProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;

  public constructor(
    @inject(EXTENSION_URI) private readonly _extensionUri: vscode.Uri,
    @inject(AlarmsService) private readonly _alarmsService: AlarmsService) { }

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    const sub = new BehaviorSubject<CloudWatchAlarmsPerProfile>({});

    this._alarmsService.alarms.subscribe(x => sub.next(x));

    sub.subscribe(x => this._view!.badge = {
      tooltip: 'Alarms triggered to state ALARM',
      value: this._alarmsService
        .flattenAlarms(x)
        .filter(x => x.StateValue === StateValue.ALARM)
        .length
    });

    // Listen for messages from the Sidebar component and execute action
    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case "onReady": {
          sub.subscribe(alarms =>
            webviewView.webview.postMessage({
              alarms
            }));
          break;
        }

        case "onError": {
          if (!data.value) {
            return;
          }
          vscode.window.showErrorMessage(data.value);
          break;
        }
      }
    });
  }

  public revive(panel: vscode.WebviewView) {
    this._view = panel;
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "reset.css"));
    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css"));
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "dist-webviews", "assets/index.js"));
    const styleMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "dist-webviews", "assets/index.css"));
    const codiconsUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'node_modules', '@vscode/codicons', 'dist', 'codicon.css'));

    // Use a nonce to only allow a specific script to be run.
    const nonce = getNonce();

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <!--
          Use a content security policy to only allow loading images from https or from our extension directory,
          and only allow scripts that have a specific nonce.
        -->
        <meta http-equiv="Content-Security-Policy" content="img-src https: data:; style-src 'unsafe-inline' ${webview.cspSource
            }; script-src 'nonce-${nonce}';">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="${styleResetUri}" rel="stylesheet">
        <link href="${styleVSCodeUri}" rel="stylesheet">
        <link href="${styleMainUri}" rel="stylesheet">
        <link href="${codiconsUri}" rel="stylesheet" />
        <script nonce="${nonce}">
            window.vscode = acquireVsCodeApi();
        </script>
      </head>
      <body style="padding: 0;">
        <div id="alarms-content"></div>
        <script nonce="${nonce}" src="${scriptUri}"></script>
      </body>
      </html>`;
  }
}

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}