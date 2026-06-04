import { render, replace, remove } from '../framework/render.js';
import ListFilterView from '../view/list-filter-view.js';
import { UpdateType, FilterType } from '../const.js';
import { filter } from '../filter.js';

export default class FilterPresenter {
  #filterContainer   = null;
  #filterModel       = null;
  #pointsModel       = null;
  #filterComponent   = null;

  constructor({ filterContainer, filterModel, pointsModel }) {
    this.#filterContainer = filterContainer;
    this.#filterModel     = filterModel;
    this.#pointsModel     = pointsModel;

    this.#pointsModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);
  }

  init() {
    const prevFilterComponent = this.#filterComponent;

    this.#filterComponent = new ListFilterView({
      filters:         this.#getFilters(),
      currentFilter:   this.#filterModel.filter,
      onFilterTypeChange: this.#handleFilterTypeChange,
    });

    if (prevFilterComponent === null) {
      render(this.#filterComponent, this.#filterContainer);
      return;
    }

    replace(this.#filterComponent, prevFilterComponent);
    remove(prevFilterComponent);
  }

  #getFilters() {
    const points = this.#pointsModel.points;

    return Object.values(FilterType).map((type) => {
      const count = filter[type](points).length;
      return {
        type,
        name:       type,
        count,
        // Фильтр заблокирован если нет ни одной точки, которой он удовлетворяет.
        // FilterType.EVERYTHING никогда не блокируется (даже при пустом списке).
        isDisabled: type !== FilterType.EVERYTHING && count === 0,
      };
    });
  }

  #handleModelEvent = () => {
    this.init();
  };

  #handleFilterTypeChange = (filterType) => {
    if (this.#filterModel.filter === filterType) { return; }
    this.#filterModel.setFilter(UpdateType.MAJOR, filterType);
  };
}
