import {inject} from 'aurelia-framework'
import {EventAggregator, Subscription} from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class EventManaged {
  _subscribers: Array<Subscription[]> = [];

  constructor(private eventBus: EventAggregator) {

  }

  /**
   * Add a subscriber to a given event
   * @param event
   * @param handler
   */
  subscribe(event, handler) {
    if (!this._subscribers[event]) {
      this._subscribers[event] = [];
    }

    this._subscribers[event].push(this.eventBus.subscribe(event, handler));
  }

  unsubscribe(event) {
    this._subscribers[event].forEach(sub => sub.dispose);
  }

  /**
   * When the element is detached
   */
  detached() {
    this._subscribers.forEach(event => this.unsubscribe);
  }
}

/**
 * List of events
 */
export const EventNames = {
  calculateImagePath: 'calculate-image-path',
  changeEditMode: 'change-edit-mode',
  checkExists: 'check-exists',
  collapsePanel: 'collapse-panel',
  conflictExists: 'conflict-exists',
  convert: 'convert',
  countryDeleted: 'country-deleted',
  panelCollapsed: "panel-collapsed",
  close: "close-dialog",
  actionError: "action-error",
  keywordSearch: "keywordSearch",
  search: "search",
  showImage: "showImage",
  save: "save",
  edit: 'edit',

  editorCancel: 'editor-cancel',

  deleteSuccessful: "delete-completed",

  create: 'create',
  manageEntity: "manage-entity",
  entityDelete: "entity-delete",
  selectEntity: "select-entity",
  entityFilter: "entity-filter",
  loadingStarted: "loading-started",
  loadingFinished: "loading-finished",
  pageChanged: "page-changed",
  pageRefreshed: "page-refreshed",
  preferenceChanged: "preference-changed",
  saveSuccessful: "save-completed",
  updateFinished: "update-finished",
  setAspects: "set-aspects",
  stampCount: "stamp-count",
  stampCountForCollection: "stamp-count-for-collection",
  stampCreate: 'stamp-create',
  stampEdit: 'stamp-edit',
  stampEditorCancel: 'stamp-edit-cancel',
  stampRemove: 'stamp-remove',
  stampSaved: 'stamp-saved',
  toggleStampSelection: 'stamp-select',
  valid: 'is-valid'
};

/**
 * List of Storage Keys
 */
export const StorageKeys = {
  referenceCatalogueNumbers: "referenceCatalogueNumbers",
  manageEntities: "manage-entities",
  listFiltering: 'list-filtering'
};

/**
 * KeyCodes
 */
export const KeyCodes = {
  VK_TAB: 9,
  VK_ENTER: 13,
  VK_ESCAPE: 27,
  VK_SHIFT: 16
};
