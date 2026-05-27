import AbstractStatefulView from '../framework/view/abstract-stateful-view';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

const EVENT_TYPES = [
  'taxi', 'bus', 'train', 'ship', 'drive',
  'flight', 'check-in', 'sightseeing', 'restaurant',
];

function createTypeListTemplate(currentType) {
  return EVENT_TYPES.map((type) => `
    <div class="event__type-item">
      <input
        id="event-type-${type}-1"
        class="event__type-input visually-hidden"
        type="radio" name="event-type" value="${type}"
        ${currentType === type ? 'checked' : ''}
      >
      <label class="event__type-label event__type-label--${type}" for="event-type-${type}-1">
        ${type[0].toUpperCase() + type.slice(1)}
      </label>
    </div>`).join('');
}

function createOffersTemplate(offersByType, selectedIds) {
  if (!offersByType?.offers?.length) { return ''; }

  return `
    <section class="event__section event__section--offers">
      <h3 class="event__section-title event__section-title--offers">Offers</h3>
      <div class="event__available-offers">
        ${offersByType.offers.map((offer) => `
          <div class="event__offer-selector">
            <input
              class="event__offer-checkbox visually-hidden"
              id="event-offer-${offer.id}"
              type="checkbox"
              name="event-offer-${offer.title}"
              ${selectedIds.includes(offer.id) ? 'checked' : ''}
            >
            <label class="event__offer-label" for="event-offer-${offer.id}">
              <span class="event__offer-title">${offer.title}</span>
              &plus;&euro;&nbsp;
              <span class="event__offer-price">${offer.price}</span>
            </label>
          </div>`).join('')}
      </div>
    </section>`;
}

function createDestinationTemplate(destinationData) {
  if (!destinationData) { return ''; }

  const photos = destinationData.pictures?.length
    ? `<div class="event__photos-container">
         <div class="event__photos-tape">
           ${destinationData.pictures
             .map((p) => `<img class="event__photo" src="${p.src}" alt="${p.description}">`)
             .join('')}
         </div>
       </div>`
    : '';

  return `
    <section class="event__section event__section--destination">
      <h3 class="event__section-title event__section-title--destination">Destination</h3>
      <p class="event__destination-description">${destinationData.description}</p>
      ${photos}
    </section>`;
}

function createRedactionFormTemplate(state, allDestinations) {
  const { type, dateFrom, dateTo, basePrice, offersByType, destinationData, offers } = state;
  const typeName = type[0].toUpperCase() + type.slice(1);

  const destinationOptions = allDestinations
    .map((d) => `<option value="${d.name}"></option>`)
    .join('');

  return `
    <li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">

          <div class="event__type-wrapper">
            <label class="event__type event__type-btn" for="event-type-toggle-1">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
            </label>
            <input class="event__type-toggle visually-hidden" id="event-type-toggle-1" type="checkbox">
            <div class="event__type-list">
              <fieldset class="event__type-group">
                <legend class="visually-hidden">Event type</legend>
                ${createTypeListTemplate(type)}
              </fieldset>
            </div>
          </div>

          <div class="event__field-group event__field-group--destination">
            <label class="event__label event__type-output" for="event-destination-1">${typeName}</label>
            <input
              class="event__input event__input--destination"
              id="event-destination-1"
              type="text"
              name="event-destination"
              value="${destinationData?.name ?? ''}"
              list="destination-list-1"
            >
            <datalist id="destination-list-1">${destinationOptions}</datalist>
          </div>

          <div class="event__field-group event__field-group--time">
            <label class="visually-hidden" for="event-start-time-1">From</label>
            <input class="event__input event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${dateFrom ?? ''}">
            &mdash;
            <label class="visually-hidden" for="event-end-time-1">To</label>
            <input class="event__input event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${dateTo ?? ''}">
          </div>

          <div class="event__field-group event__field-group--price">
            <label class="event__label" for="event-price-1">
              <span class="visually-hidden">Price</span>&euro;
            </label>
            <input
              class="event__input event__input--price"
              id="event-price-1"
              type="text"
              name="event-price"
              value="${basePrice}"
              inputmode="numeric"
            >
          </div>

          <button class="event__save-btn btn btn--blue" type="submit">Save</button>
          <button class="event__reset-btn" type="reset">Delete</button>
          <button class="event__rollup-btn" type="button">
            <span class="visually-hidden">Open event</span>
          </button>
        </header>

        <section class="event__details">
          ${createOffersTemplate(offersByType, offers)}
          ${createDestinationTemplate(destinationData)}
        </section>
      </form>
    </li>`;
}

export default class RedactionFormView extends AbstractStatefulView {
  #allOffers = null;
  #allDestinations = null;
  #onCloseRedactionButtonClick = null;
  #onSubmitButtonClick = null;
  #onDeleteButtonClick = null;
  #datepickerFrom = null;
  #datepickerTo = null;

  constructor({
    point,
    allOffers,
    allDestinations,
    onCloseRedactionButtonClick,
    onSubmitButtonClick,
    onDeleteButtonClick,
  }) {
    super();
    this.#allOffers = allOffers;
    this.#allDestinations = allDestinations;
    this.#onCloseRedactionButtonClick = onCloseRedactionButtonClick;
    this.#onSubmitButtonClick = onSubmitButtonClick;
    this.#onDeleteButtonClick = onDeleteButtonClick;

    this._state = RedactionFormView.parsePointToState(point, allOffers, allDestinations);
    this.#setEventListeners();
  }

  get template() {
    return createRedactionFormTemplate(this._state, this.#allDestinations);
  }

  _restoreHandlers() {
    this.#setEventListeners();
  }

  removeElement() {
    super.removeElement();
    this.#destroyDatepickers();
  }

  reset(point) {
    this.updateElement(
      RedactionFormView.parsePointToState(point, this.#allOffers, this.#allDestinations),
    );
  }

  // ── Приватные методы ──────────────────────────────────────────────────────

  #setEventListeners() {
    this.element
      .querySelector('.event.event--edit')
      .addEventListener('submit', this.#submitHandler);

    this.element
      .querySelector('.event__rollup-btn')
      .addEventListener('click', this.#closeHandler);

    this.element
      .querySelector('.event__reset-btn')
      .addEventListener('click', this.#deleteHandler);

    this.element
      .querySelector('.event__type-group')
      .addEventListener('change', this.#typeChangeHandler);

    this.element
      .querySelector('.event__input--destination')
      .addEventListener('change', this.#destinationChangeHandler);

    // ✅ Безопасность: только цифры в поле цены
    this.element
      .querySelector('.event__input--price')
      .addEventListener('input', this.#priceInputHandler);

    this.#setDatepickers();
  }

  #setDatepickers() {
    this.#destroyDatepickers();

    const commonConfig = {
      dateFormat: 'd/m/y H:i',
      enableTime: true,
      'time_24hr': true,
    };

    this.#datepickerFrom = flatpickr(
      this.element.querySelector('#event-start-time-1'),
      {
        ...commonConfig,
        defaultDate: this._state.dateFrom,
        onClose: ([date]) => {
          if (!date) { return; }
          this._setState({ dateFrom: date.toISOString() });
          this.#datepickerTo?.set('minDate', date);
        },
      },
    );

    this.#datepickerTo = flatpickr(
      this.element.querySelector('#event-end-time-1'),
      {
        ...commonConfig,
        defaultDate: this._state.dateTo,
        minDate: this._state.dateFrom,
        onClose: ([date]) => {
          if (!date) { return; }
          this._setState({ dateTo: date.toISOString() });
        },
      },
    );
  }

  #destroyDatepickers() {
    this.#datepickerFrom?.destroy();
    this.#datepickerTo?.destroy();
    this.#datepickerFrom = null;
    this.#datepickerTo = null;
  }

  // ── Обработчики ──────────────────────────────────────────────────────────

  #typeChangeHandler = (evt) => {
    if (evt.target.tagName !== 'INPUT') { return; }

    this.updateElement({
      type: evt.target.value,
      offers: [],
      offersByType: this.#allOffers.find((o) => o.type === evt.target.value)
        ?? { type: evt.target.value, offers: [] },
    });
  };

  #destinationChangeHandler = (evt) => {
    const input = evt.target.value.trim();

    // ✅ Безопасность: принимаем только города из списка
    const found = this.#allDestinations.find((d) => d.name === input);
    if (!found) {
      evt.target.value = this._state.destinationData?.name ?? '';
      return;
    }

    this.updateElement({ destination: found.id, destinationData: found });
  };

  // ✅ Безопасность: запрещаем любой ввод кроме цифр
  #priceInputHandler = (evt) => {
    evt.target.value = evt.target.value.replace(/\D/g, '');
    this._setState({ basePrice: Number(evt.target.value) });
  };

  #closeHandler = (evt) => {
    evt.preventDefault();
    this.#onCloseRedactionButtonClick();
  };

  #submitHandler = (evt) => {
    evt.preventDefault();
    this.#onSubmitButtonClick(RedactionFormView.parseStateToPoint(this._state));
  };

  #deleteHandler = (evt) => {
    evt.preventDefault();
    this.#onDeleteButtonClick(RedactionFormView.parseStateToPoint(this._state));
  };

  // ── Статические хелперы ──────────────────────────────────────────────────

  static parsePointToState(point, allOffers, allDestinations) {
    return {
      ...point,
      offersByType: allOffers.find((o) => o.type === point.type)
        ?? { type: point.type, offers: [] },
      destinationData: allDestinations.find((d) => d.id === point.destination) ?? null,
    };
  }

  static parseStateToPoint(state) {
    const point = { ...state };
    delete point.offersByType;
    delete point.destinationData;
    return point;
  }
}
