import {bindable, customElement, autoinject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {EventManaged, EventNames} from '../../../EventManaged';

@autoinject
export class CollapsePanel extends EventManaged {

  /**
   * Title contents
   */
  @bindable title: string;

  /**
   * Boolean triggering the opening of the panel
   * @type {boolean}
   */
  @bindable collapsed: boolean = false;

  /**
   * Name of the panel
   * @type {string}
   */
  @bindable name: string = 'collapsing-panel';

  constructor(private ea: EventAggregator) {
    super(ea);
  }

  attached() {
    this.setupSubscriptions();
  }

  private setupSubscriptions() {
    this.subscribe(EventNames.collapsePanel, this.hide.bind(this));
  }

  /**
   * Hide the panel
   */
  private hide() {
    this.collapsed = true;
    // Publish that the panel is collapsed
    this.ea.publish(EventNames.panelCollapsed, {name: this.name});
  }
}
