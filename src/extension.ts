import * as vscode from 'vscode';

import { AlarmsService } from './services/alarms.service';
import { SidebarProvider } from './services/sidebar.provider';

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const alarmsService = new AlarmsService();
	alarmsService.initialize();
	const sidebarProvider = new SidebarProvider(
		context.extensionUri,
		alarmsService);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			"hobart2967-cloudwatch-alarms-sidebar",
			sidebarProvider
		)
	);
}

// This method is called when your extension is deactivated
export function deactivate() {}

