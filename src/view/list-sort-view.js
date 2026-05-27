import AbstractView from '../framework/view/abstract-view';
import { SortType } from '../const';

const SORT_ITEMS = [
  { type: SortType.DAY, label: 'Day', disabled: false },
  { type: null, label: 'Event', disabled: true },
  { type: SortType.TIME, label: 'Time', disabled: false },
  { type: SortType.PRICE, label: 'Price', disabled: false },
  { type: null, label: 'Offers', disabled: true },
];

function createSortTemplate(currentSortType) {
  const items = SORT_ITEMS.map(({ type, label, disabled }) => `
    <div class="trip-sort__item trip-sort__item--${label.toLowerCase()}">
      <input
        id="sort-${label.toLowerCase()}"
        class="trip-sort__input visually-hidden"
        type="radio"
        name="trip-sort"
        value="${type ?? ''}"
        ${type ? `data-sort-type="${type}"` : ''}
        ${type === currentSortType ? 'checked' : ''}
        ${disabled ? 'disabled' : ''}
      >
      <label class="trip-sort__btn" for="sort-${label.toLowerCase()}">${label}</label>
    </div>
  `).join('');

  return `<form class="trip-events__trip-sort trip-sort" action="#" method="get">${items}</form>`;
}

export default class ListSortView extends AbstractView {
  #currentSortType = null;
  #onSortTypeChange = null;

  constructor({ currentSortType, onSortTypeChange }) {
    super();
    this.#currentSortType = currentSortType;
    this.#onSortTypeChange = onSortTypeChange;
    this.element.addEventListener('change', this.#sortTypeChangeHandler);
  }

  get template() {
    return createSortTemplate(this.#currentSortType);
  }

  #sortTypeChangeHandler = (evt) => {
    const sortType = evt.target.dataset.sortType;
    if (!sortType) {
      return;
    }
    this.#onSortTypeChange(sortType);
  };
}
