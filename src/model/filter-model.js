import Observable from '../framework/observable.js';
import { FilterType } from '../const.js';

export default class FilterModel extends Observable {
  #filter = FilterType.EVERYTHING;

  get filter() {
    return this.#filter;
  }

  setFilter(updateType, filterType) {
    this.#filter = filterType;
    this._notify(updateType, filterType);
  }
}
