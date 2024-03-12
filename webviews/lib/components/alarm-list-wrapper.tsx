import { StateValue } from '@aws-sdk/client-cloudwatch';
import { createSignal, For } from 'solid-js';

import { CloudWatchAlarm } from '../models/cloud-watch-alarm';
import { Alarm } from './alarm';

export interface AlarmListWrapperProps {
  alarms: CloudWatchAlarm[];
  title: string;
  searchTerm: string;
  stateValue: StateValue;
}
export function AlarmListWrapper(props: AlarmListWrapperProps) {
  const alarms = () => props.alarms;
  const count = () => props.alarms.length;
  const title = () => props.title;
  const searchTerm = () => props.searchTerm;
  const storageKey = () => 'list-state.' + props.stateValue.toString();
  const [expansionState, setExpansionState] = createSignal(localStorage.getItem(storageKey()) || '--expanded');

  function toggleExpansionState() {
    if (expansionState() === '--expanded') {
      setExpansionState('--collapsed');
    } else {
      setExpansionState('--expanded');
    }

    localStorage.setItem(storageKey(), expansionState());
  }

  return (<>
    <style type="text/css">{`
      .alarm-list-wrapper .title:hover {
        background-color: var(--vscode-list-hoverBackground);
      }

      .alarm-list-wrapper .title {
        display: flex;
        gap: 8px;
        align-items: center;

        text-transform: uppercase;
        font-weight: bold;
        cursor: pointer;
        padding: 2px;

        position: sticky;
        left: 0;
        top: 0;
        background: var(--panel-view-background);
      }

      .alarm-list-wrapper .title.title--expanded .codicon-chevron-down {
        display: block;
      }

      .alarm-list-wrapper .title.title--expanded .codicon-chevron-right {
        display: none;
      }

      .alarm-list-wrapper .title.title--collapsed .codicon-chevron-down {
        display: none;
      }

      .alarm-list-wrapper .title.title--collapsed .codicon-chevron-right {
        display: block;
      }

      .alarm-list-wrapper .content.content--collapsed {
        display: none;
      }

      .alarm-list {
        margin: 0;
        padding: 0;
      }
    `}
    </style>

    <div class="alarm-list-wrapper">
      <div class={"title title" + expansionState()} onClick={() => toggleExpansionState()}>
        <span class="codicon codicon-chevron-down"></span>
        <span class="codicon codicon-chevron-right"></span>
        <span>{title()} ({count()})</span>
      </div>
      <div class={"content content" + expansionState()}>
        <ul class='alarm-list'>
          <For each={alarms().filter(x => x.AlarmName!.toLowerCase().includes(searchTerm().toLowerCase()))}>
            { alarm => <Alarm alarm={alarm}/> }
          </For>
        </ul>
      </div>
    </div>
  </>);
}