import 'reflect-metadata';

import { Container, interfaces } from 'inversify';
import vscode, { ExtensionContext } from 'vscode';

import { AlarmsBootstrapper } from './bootstrappers/alarms.bootstrapper';
import { Bootstrapper } from './bootstrappers/bootstrapper';
import { SidebarBootstrapper } from './bootstrappers/sidebar.bootstrapper';
import { EXTENSION_CONTEXT } from './constants/extension-context';
import { EXTENSION_URI } from './constants/extension-uri';
import { VSCODE_WINDOW } from './constants/vscode';
import { ExtensionManager } from './extension-manager';
import { AlarmsService } from './services/alarms.service';
import { SidebarProvider } from './services/sidebar.provider';

interface ContainerSetup {
	bootstrappers: interfaces.Newable<Bootstrapper>[];
	constants: [interfaces.ServiceIdentifier<unknown>, unknown][];
	services: interfaces.ServiceIdentifier<unknown>[];
}

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const container = new Container();

// This method is called when your extension is	 activated
// Your extension is activated the very first time the command is executed
export async function activate(context: ExtensionContext): Promise<void> {
	setupContainer(context);

	const bootstrappers = container.getAll(Bootstrapper);
	for (const bootstrapper of bootstrappers.filter(x => !!x.onInit)) {
		await bootstrapper.onInit!();
	}

	const manager = container.get(ExtensionManager);
	manager.activate(context);
}

function setupContainer(context: ExtensionContext) {
	const setup: ContainerSetup = {
		bootstrappers: [
			AlarmsBootstrapper,
			SidebarBootstrapper
		],
		services: [
			AlarmsService,
			SidebarProvider,
			ExtensionManager
		],
		constants: [
			[VSCODE_WINDOW, vscode.window],
			[EXTENSION_CONTEXT, context],
			[EXTENSION_URI, context.extensionUri]
		]
	};

	for (const [token, value] of setup.constants) {
		container
			.bind(token)
			.toConstantValue(value);
	}

	for (const bootstrapper of setup.bootstrappers) {
		container
			.bind(Bootstrapper)
			.to(bootstrapper)
			.inSingletonScope();
	}

	for (const service of setup.services) {
		container
			.bind(service)
			.toSelf()
			.inSingletonScope();
	}
}

// This method is called when your extension is deactivated
export async function deactivate() {
	const bootstrappers = container.getAll(Bootstrapper);
	for (const bootstrapper of bootstrappers.filter(x => !!x.onDestroy)) {
		await bootstrapper.onDestroy!();
	}
}

