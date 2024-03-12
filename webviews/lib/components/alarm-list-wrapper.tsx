import { For } from 'solid-js';

import { CloudWatchAlarm } from '../models/cloud-watch-alarm';
import { Alarm } from './alarm';

export interface AlarmListWrapperProps {
  alarms: CloudWatchAlarm[];
  title: string;
  searchTerm: string;
}
export function AlarmListWrapper(props: AlarmListWrapperProps) {
  const alarms = () => props.alarms;
  const title = () => props.title;
  const searchTerm = () => props.searchTerm;

  return (<>
    <style type="text/css">{`
      .alarm-list-wrapper {
        margin-bottom: 16px;
      }

      .alarm-list-wrapper .title {
        display: flex;

        text-transform: uppercase;
        font-weight: bold;
        cursor: pointer;
        padding: 4px 8px;

        position: sticky;
        left: 0;
        top: 0;
        background: var(--panel-view-background);
        box-shadow: 0px 3px 4px var(--button-secondary-background);
      }

      .alarm-list {
        margin: 0;
        padding: 0;
      }
    `}
    </style>

    <div class="alarm-list-wrapper">
      <div class="title">{title()}</div>
      <div class="content">
        <ul class='alarm-list'>
          <For each={alarms().filter(x => x.AlarmName!.toLowerCase().includes(searchTerm().toLowerCase()))}>
            { alarm => <Alarm alarm={alarm}/> }
          </For>
        </ul>
      </div>
    </div>
  </>);
}