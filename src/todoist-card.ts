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
  TASK_END_DATETIME,
  TASK_PARENT_ID,
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
    console.log(stateObj.attributes);
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
      //console.log('point1 - queue not empty length', [pindentData.indentQueue.length]);
      if (ptask[TASK_PARENT_ID]) {
        const found = pindentData.indentQueue.indexOf(ptask[TASK_PARENT_ID]);
        //check if parent_id is currently in the queue
        /* console.log('point2 current task has parent id (pindent, found, summary, parent id', [
          pindentData.currentIndent,
          found,
          ptask[TASK_SUMMARY],
          ptask[TASK_PARENT_ID],
        ]); */
        if (found == -1) {
          /* console.log('point3 task not in queue, so go deeper (pindent, found ,summary, parent id', [
            pindentData.currentIndent,
            found,
            ptask[TASK_SUMMARY],
            ptask[TASK_PARENT_ID],
          ]); */
          pindentData.indentQueue.push(ptask[TASK_PARENT_ID]);
          pindentData.currentIndent += 1;
          /*  console.log('point3 - after update, so go deeper (pindent, found ,summary, parent id', [
            pindentData.currentIndent,
            found,
            ptask[TASK_SUMMARY],
            ptask[TASK_PARENT_ID],
          ]); */
        } else if (found != pindentData.indentQueue.length - 1) {
          //we could be going back multiple levels so check how many times to indent left
          /* console.log(
            'point4 if parent_id is not in last position in queue, go shallow (pindent, found, queuelength,summary, parent id',
            [
              pindentData.currentIndent,
              found,
              pindentData.indentQueue.length,
              ptask[TASK_SUMMARY],
              ptask[TASK_PARENT_ID],
            ],
          ); */
          while (found != pindentData.indentQueue.length - 1) {
            pindentData.indentQueue.pop();
            pindentData.currentIndent -= 1;
          }
          /* console.log(
            'point4 - after if parent_id is not in last position in queue, go shallow (pindent, found, queuelength,summary, parent id',
            [
              pindentData.currentIndent,
              found,
              pindentData.indentQueue.length,
              ptask[TASK_SUMMARY],
              ptask[TASK_PARENT_ID],
            ],
          ); */
        }
      } else {
        // no Parent_id found so decrease indent to base level
        /* console.log('point5 no parent id so go back to base - before (pindent, tasksummary, queue length)', [
          pindentData.currentIndent,
          ptask[TASK_SUMMARY],
          pindentData.indentQueue.length,
        ]); */
        pindentData.indentQueue = [];
        pindentData.currentIndent = pindentData.baseIndent;
        /* console.log('point5 no parent id so go back to base - after (pindent, tasksummary, queue length)', [
          pindentData.currentIndent,
          ptask[TASK_SUMMARY],
          pindentData.indentQueue.length,
        ]); */
      }
    } else if (ptask[TASK_PARENT_ID]) {
      //queue is empty so if parent_id exist push it and increase indent
      /* console.log('point6 - main else if - before (pindent, summary, queue length', [
        pindentData.currentIndent,
        ptask[TASK_SUMMARY],
        pindentData.indentQueue.length,
      ]); */
      pindentData.indentQueue.push(ptask[TASK_PARENT_ID]);
      pindentData.currentIndent += 1;
      /* console.log('point6 - main else if- after', [
        pindentData.currentIndent,
        ptask[TASK_SUMMARY],
        pindentData.indentQueue.length,
      ]); */
    }
    return html`
      <li class="li-priority${ptask[TASK_PRIORITY]}" style="margin-left:${pindentData.currentIndent * 20}px">
        ${ptask[TASK_SUMMARY]} ${this.renderDueDate(ptask)}
      </li>
    `;
  }

  private renderDueDate(ptask): TemplateResult {
    if (!ptask[TASK_END_DATETIME] || ptask[TASK_END_DATETIME] == null) return html``;

    return html`
      ${ptask[TASK_END_DATETIME]}
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
        padding-top: 0px;
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
      .card-content .li-priority1 {
        border-bottom: 1px var(--mdc-radio-disabled-color) solid;
      }
      .card-content .li-priority1::before {
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
      }
    `;
  }
}
