import AbstractView from '../framework/view/abstract-view';

function createFilterItemTemplate({ type, name, isDisabled, isChecked }) {
  return `
    <div class="trip-filters__filter">
      <input
        id="filter-${type}"
        class="trip-filters__filter-input visually-hidden"
        type="radio"
        name="trip-filter"
        value="${type}"
        ${isChecked ? 'checked' : ''}
        ${isDisabled ? 'disabled' : ''}
      >
      <label class="trip-filters__filter-label" for="filter-${type}">
        ${name[0].toUpperCase() + name.slice(1)}
      </label>
    </div>`;
}

function createListFilterTemplate(filters) {
  return `
    <form class="trip-filters" action="#" method="get">
      ${filters.map((f) => createFilterItemTemplate(f)).join('')}
      <button class="visually-hidden" type="submit">Accept filter</button>
    </form>`;
}

export default class ListFilterView extends AbstractView {
  #filters = null;
  #onFilterTypeChange = null;

  constructor({ filters, currentFilter, onFilterTypeChange }) {
    super();
    this.#filters = filters.map((f) => ({ ...f, isChecked: f.type === currentFilter }));
    this.#onFilterTypeChange = onFilterTypeChange;
    this.element.addEventListener('change', this.#filterTypeChangeHandler);
  }

  get template() {
    return createListFilterTemplate(this.#filters);
  }

  #filterTypeChangeHandler = (evt) => {
    evt.preventDefault();
    this.#onFilterTypeChange(evt.target.value);
  };
}
