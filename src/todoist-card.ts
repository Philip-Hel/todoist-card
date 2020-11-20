/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { LitElement, html, customElement, property, CSSResult, TemplateResult, css, PropertyValues } from 'lit-element';
import {
  HomeAssistant,
  hasConfigOrEntityChanged,
  /* hasAction, */
  ActionHandlerEvent,
  handleAction,
  LovelaceCardEditor,
  getLovelace,
} from 'custom-card-helpers';

import './editor';

import { TodoistCardConfig } from './types';
/*import { actionHandler } from './action-handler-directive';*/
import {
  CARD_VERSION,
  DEFAULT_ICON,
  PROJECT_COLOUR,
  PARENT_SUMMARY,
  PROJECT_TASKS,
  TASK_SUMMARY,
  TASK_PRIORITY,
  TASK_PARENT_ID,
  TASK_DUE_TODAY,
  TASK_DUE_TOMORROW,
  TASK_DUE_FORMATTED,
  TASK_OVERDUE,
  TASK_NEXT7DAYS,
  TASK_RECURRENCE,
} from './const';

import { localize } from './localize/localize';
import { HassEntity } from 'home-assistant-js-websocket';

/* eslint no-console: 0 */
console.info(
  `%c  TODOIST-CARD \n%c  ${localize('common.version')} ${CARD_VERSION}    `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);

(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'todoist-card',
  name: 'Todoist Card',
  description: 'A Todoist card showing a project and tasks.',
});

@customElement('todoist-card')
export class TodoistCard extends LitElement {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    return document.createElement('todoist-card-editor');
  }

  public static getStubConfig(): object {
    return {};
  }

  // TODO Add any properities that should cause your element to re-render here
  @property() public hass!: HomeAssistant;
  @property() private config!: TodoistCardConfig;

  public setConfig(config: TodoistCardConfig): void {
    // TODO Check for required fields and that they are of the proper format
    if (!config || config.show_error) {
      throw new Error(localize('common.invalid_configuration'));
    }

    if (config.test_gui) {
      getLovelace().setEditMode(true);
    }

    this.config = {
      icon: DEFAULT_ICON,
      ...config,
    };
    //call api to update platform
    // this.hass.callApi<any>('GET', `calendars/${config.entity}`);
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    if (!this.config) {
      return false;
    }

    return hasConfigOrEntityChanged(this, changedProps, false);
  }

  protected render(): TemplateResult | void {
    if (!this.config || !this.hass) {
      this.showWarning(localize('Hass or Config not defined'));
    }

    const stateObj = this.hass.states[this.config.entity!];
    /* console.log(stateObj.attributes); */
    if (!stateObj) {
      this.showWarning(localize('Entity not found'));
    }

    if (!stateObj.attributes[PROJECT_TASKS]) {
      return html``;
    }
    /**
    return html`
      <ha-card
        .header=${this.config.name || stateObj.attributes.friendly_name}
        @action=${this._handleAction}
        .actionHandler=${actionHandler({
          hasHold: hasAction(this.config.hold_action),
          hasDoubleClick: hasAction(this.config.double_tap_action),
        })}
      ></ha-card>
    `;
     */
    return html`
      <ha-card>
        ${this.renderheading(stateObj)} ${this.rendercontent(stateObj)}
      </ha-card>
    `;
  }

  private renderheading(stateObj: HassEntity): TemplateResult {
    const hColor = this.convertcolour(stateObj.attributes[PROJECT_COLOUR]);
    return html`
      <div class="card-header">
        <div class="name">
          ${this.config.icon
            ? html`
                <ha-icon class="icon" .icon="${this.config.icon || DEFAULT_ICON}" style="color: ${hColor};"></ha-icon>
              `
            : ''}
          ${this.config.name || stateObj.attributes.friendly_name}
        </div>
        <div class="parent-summary">${stateObj.attributes[PARENT_SUMMARY]}</div>
        <hr
          class="divider"
          style="background-image: linear-gradient(to right, ${hColor}, ${hColor}, rgba(0, 0, 0, 0));"
        />
      </div>
    `;
  }

  private convertcolour(proj_colour_id: number): string {
    let calculatedColour = '';
    switch (proj_colour_id) {
      case 1:
        calculatedColour += '#808080';
        break;
      case 2:
        calculatedColour += '#5297ff';
        break;
      case 3:
        calculatedColour += '#ff9a14';
        break;
      case 4:
        calculatedColour += '#ff7066';
        break;
      case 30:
        calculatedColour += '#b8256f';
        break;
      case 31:
        calculatedColour += '#db4035';
        break;
      case 32:
        calculatedColour += '#ff9933';
        break;
      case 33:
        calculatedColour += '#fad000';
        break;
      case 34:
        calculatedColour += '#afb83b';
        break;
      case 35:
        calculatedColour += '#7ecc49';
        break;
      case 36:
        calculatedColour += '#299438';
        break;
      case 37:
        calculatedColour += '#6accbc';
        break;
      case 38:
        calculatedColour += '#158fad';
        break;
      case 39:
        calculatedColour += '#14aaf5';
        break;
      case 40:
        calculatedColour += '#96c3eb';
        break;
      case 41:
        calculatedColour += '#4073ff';
        break;
      case 42:
        calculatedColour += '#884dff';
        break;
      case 43:
        calculatedColour += '#af38eb';
        break;
      case 44:
        calculatedColour += '#eb96eb';
        break;
      case 45:
        calculatedColour += '#e05194';
        break;
      case 46:
        calculatedColour += '#ff8d85';
        break;
      case 47:
        calculatedColour += '#808080';
        break;
      case 48:
        calculatedColour += '#b8b8b8';
        break;
      case 49:
        calculatedColour += '#ccac93';
        break;
      default:
        calculatedColour += 'white';
        break;
    }
    return calculatedColour;
  }

  private _handleAction(ev: ActionHandlerEvent): void {
    if (this.hass && this.config && ev.detail.action) {
      handleAction(this, this.hass, this.config, ev.detail.action);
    }
  }

  private showWarning(warning: string): TemplateResult {
    return html`
      <hui-warning>${warning}</hui-warning>
    `;
  }

  private showError(error: string): TemplateResult {
    const errorCard = document.createElement('hui-error-card');
    errorCard.setConfig({
      type: 'error',
      error,
      origConfig: this.config,
    });

    return html`
      ${errorCard}
    `;
  }

  private rendercontent(stateObj: HassEntity): TemplateResult {
    const tasks = stateObj.attributes[PROJECT_TASKS];
    const indentData: { baseIndent: number; currentIndent: number; indentQueue: string[] } = {
      baseIndent: 1,
      currentIndent: 1,
      indentQueue: [],
    };
    if (this.config.list_height) {
      return html`
        <ul class="card-content" style="height:${this.config.list_height}; overflow:hidden; overflow-y:scroll;">
          ${tasks!.map(task => this.rendertask(task, indentData))}
        </ul>
      `;
    }
    return html`
      <ul class="card-content">
        ${tasks!.map(task => this.rendertask(task, indentData))}
      </ul>
    `;
  }

  private rendertask(
    ptask,
    pindentData: { baseIndent: number; currentIndent: number; indentQueue: string[] },
  ): TemplateResult {
    //if queue is greater than 0 then check if we need to go up or down or stay the same, if 0 check if we need to go up else do nothing
    if (pindentData.indentQueue.length > 0) {
      if (ptask[TASK_PARENT_ID]) {
        const found = pindentData.indentQueue.indexOf(ptask[TASK_PARENT_ID]);
        //check if parent_id is currently in the queue
        if (found == -1) {
          pindentData.indentQueue.push(ptask[TASK_PARENT_ID]);
          pindentData.currentIndent += 1;
        } else if (found != pindentData.indentQueue.length - 1) {
          //we could be going back multiple levels so check how many times to indent left
          while (found != pindentData.indentQueue.length - 1) {
            pindentData.indentQueue.pop();
            pindentData.currentIndent -= 1;
          }
        }
      } else {
        // no Parent_id found so decrease indent to base level
        pindentData.indentQueue = [];
        pindentData.currentIndent = pindentData.baseIndent;
      }
    } else if (ptask[TASK_PARENT_ID]) {
      //queue is empty so if parent_id exist push it and increase indent
      pindentData.indentQueue.push(ptask[TASK_PARENT_ID]);
      pindentData.currentIndent += 1;
    }
    return html`
      <li class="li-priority" style="margin-left:${pindentData.currentIndent * 20}px">
        <div class="task-row">
          <span>
            <svg class="li-bullet" width="16px" height="18px" viewBox="0 0 24 24">
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke-width="2"
                stroke=${this.convertcolour(ptask[TASK_PRIORITY])}
                fill=${this.convertcolour(ptask[TASK_PRIORITY])}
                fill-opacity="0.4"
              />
            </svg>
            ${ptask[TASK_SUMMARY]}
          </span>
          ${this.renderDueDate(ptask)}
        </div>
      </li>
    `;
  }

  private renderDueDate(ptask): TemplateResult {
    if (!ptask[TASK_DUE_FORMATTED] || ptask[TASK_DUE_FORMATTED] == null) return html``;
    let classid = '';
    if (ptask[TASK_OVERDUE]) classid = 'due-overdue';
    else if (ptask[TASK_DUE_TODAY]) classid = 'due-today';
    else if (ptask[TASK_DUE_TOMORROW]) classid = 'due-tomorrow';
    else if (ptask[TASK_NEXT7DAYS]) classid = 'due-next7days';
    else classid = 'due-default';
    return html`
      <div class="${classid}">
        ${this.renderCalendarIcon()}<span> ${ptask[TASK_DUE_FORMATTED]} </span>${ptask[TASK_RECURRENCE]
          ? this.renderRecurringIcon()
          : ''}
      </div>
    `;
  }
  private renderCalendarIcon(): TemplateResult {
    return html`
      <svg width="12" height="12" viewBox="0 0 12 12" class="calendar_icon">
        <path
          fill="currentColor"
          fill-rule="nonzero"
          d="M9.5 1A1.5 1.5 0 0 1 11 2.5v7A1.5 1.5 0 0 1 9.5 11h-7A1.5 1.5 0 0 1 1 9.5v-7A1.5 1.5 0 0 1 2.5 1h7zm0 1h-7a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.5-.5zM8 7.25a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5zM8.5 4a.5.5 0 0 1 0 1h-5a.5.5 0 0 1 0-1h5z"
        ></path>
      </svg>
    `;
  }
  private renderRecurringIcon(): TemplateResult {
    return html`
      <svg width="12" height="12" viewBox="0 0 12 12" class="recurring_icon">
        <path
          fill="currentColor"
          d="M2.784 4.589l.07.057 1.5 1.5a.5.5 0 01-.638.765l-.07-.057L3 6.207V7a2 2 0 001.85 1.995L5 9h2.5a.5.5 0 01.09.992L7.5 10H5a3 3 0 01-2.995-2.824L2 7v-.793l-.646.647a.5.5 0 01-.638.057l-.07-.057a.5.5 0 01-.057-.638l.057-.07 1.5-1.5a.5.5 0 01.638-.057zM7 2a3 3 0 013 3v.792l.646-.646a.5.5 0 01.765.638l-.057.07-1.5 1.5a.5.5 0 01-.638.057l-.07-.057-1.5-1.5a.5.5 0 01.638-.765l.07.057.646.646V5a2 2 0 00-1.85-1.995L7 3H4.5a.5.5 0 010-1z"
        ></path>
      </svg>
    `;
  }
  static get styles(): CSSResult {
    return css`
      ha-card {
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
      }
      .card-header {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        padding-top: 6px;
        line-height: 36px;
        flex-wrap: wrap;
      }
      .card-header .divider {
        width: 100%;
        border: 0;
        height: 1px;
        margin-top: 5px;
        margin-bottom: 0px;
      }
      .card-header .name {
        display: flex;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .card-header .name .icon {
        margin-top: -1px;
      }
      .card-header .parent-summary {
        font-size: 14px;
        color: var(--secondary-text-color);
        line-height: 18px;
        margin-block: auto;
      }
      .card-content {
        display: flex;
        flex-direction: column;
        padding-bottom: 0px;
        justify-content: flex-start;
        list-style: none;
        padding-left: 0em;
      }

      /* Scroll 2 */
      .card-content::-webkit-scrollbar {
        width: 5px;
        height: 5px;
      }
      .card-content::-webkit-scrollbar-track {
        background-color: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
      }
      .card-content::-webkit-scrollbar-thumb {
        background-color: #11171a;
        border-radius: 10px;
      }

      .card-content .li-priority {
        border-bottom: 1px var(--mdc-radio-disabled-color) solid;
      }

      .card-content .li-priority .li-bullet {
        vertical-align: middle;
      }
      /*   .card-content .li-priority1::before {
        content: '';
        display: inline-block;
        height: 1em;
        width: 1em;
        background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><circle cx='12' cy='12' r='9' stroke-width='2' stroke='%23808080' fill='%23808080'  fill-opacity='0.4'/></svg>");
        background-size: contain;
        background-repeat: no-repeat;
        margin-right: 0.5em;
      }
      .card-content .li-priority2 {
        border-bottom: 1px var(--mdc-radio-disabled-color) solid;
      }
      .card-content .li-priority2::before {
        content: '';
        display: inline-block;
        height: 1em;
        width: 1em;
        background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><circle cx='12' cy='12' r='9' stroke-width='2' stroke='%235297ff' fill='%235297ff'  fill-opacity='0.4'/></svg>");
        background-size: contain;
        background-repeat: no-repeat;
        margin-right: 0.5em;
      }
      .card-content .li-priority3 {
        border-bottom: 1px var(--mdc-radio-disabled-color) solid;
      }
      .card-content .li-priority3::before {
        content: '';
        display: inline-block;
        height: 1em;
        width: 1em;
        background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><circle cx='12' cy='12' r='9' stroke-width='2' stroke='%23ff9a14' fill='%23ff9a14'  fill-opacity='0.4'/></svg>");
        background-size: contain;
        background-repeat: no-repeat;
        margin-right: 0.5em;
      }
      .card-content .li-priority4 {
        border-bottom: 1px var(--mdc-radio-disabled-color) solid;
      }
      .card-content .li-priority4::before {
        content: '';
        display: inline-block;
        height: 1em;
        width: 1em;
        background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><circle cx='12' cy='12' r='9' stroke-width='2' stroke='%23ff7066' fill='%23ff7066'  fill-opacity='0.4'/></svg>");
        background-size: contain;
        background-repeat: no-repeat;
        margin-right: 0.5em;
      } */
      .card-content .task-row {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        flex-wrap: wrap;
      }
      .card-content .due-overdue {
        color: #ff7066;
      }
      .card-content .due-today {
        color: #25b84c;
      }
      .card-content .due-tomorrow {
        color: #ff9a14;
      }
      .card-content .due-next7days {
        color: #a970ff;
      }
      .card-content .due-default {
        color: hsla(0, 0%, 100%, 0.6);
      }
    `;
  }
}
