import { provideVSCodeDesignSystem, vsCodeButton, vsCodeTextField } from '@vscode/webview-ui-toolkit';
import { render } from 'solid-js/web';

import { AlarmsSidebar } from './components/alarms-sidebar';

provideVSCodeDesignSystem().register(vsCodeButton(), vsCodeTextField());

render(() => <AlarmsSidebar />, document.getElementById('alarms-content')!);
