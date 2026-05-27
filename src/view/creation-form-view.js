import AbstractStatefulView from '../framework/view/abstract-stateful-view';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

const EVENT_TYPES = [
  'taxi', 'bus', 'train', 'ship', 'drive',
  'flight', 'check-in', 'sightseeing', 'restaurant',
];
const DEFAULT_TYPE = 'flight';

// ── Шаблоны (аналогичны RedactionFormView) ────────────────────────────────────

function createTypeListTemplate(currentType) {
  return EVENT_TYPES.map((type) => `
    <div class="event__type-item">
      <input
        id="event-type-${type}-create"
        class="event__type-input visually-hidden"
        type="radio" name="event-type" value="${type}"
        ${currentType === type ? 'checked' : ''}
      >
      <label class="event__type-label event__type-label--${type}" for="event-type-${type}-create">
        ${type[0].toUpperCase() + type.slice(1)}
      </label>
    </div>`).join('');
}

function createOffersTemplate(offersByType) {
  if (!offersByType?.offers?.length) { return ''; }

  return `
    <section class="event__section event__section--offers">
      <h3 class="event__section-title event__section-title--offers">Offers</h3>
      <div class="event__available-offers">
        ${offersByType.offers.map((offer) => `
          <div class="event__offer-selector">
            <input
              class="event__offer-checkbox visually-hidden"
              id="event-offer-create-${offer.id}"
              type="checkbox"
              name="event-offer-${offer.title}"
            >
            <label class="event__offer-label" for="event-offer-create-${offer.id}">
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

function createCreationFormTemplate(state, allDestinations) {
  const { type, dateFrom, dateTo, offersByType, destinationData } = state;
  const typeName = type[0].toUpperCase() + type.slice(1);

  const destinationOptions = allDestinations
    .map((d) => `<option value="${d.name}"></option>`)
    .join('');

  return `
    <li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">

          <div class="event__type-wrapper">
            <label class="event__type event__type-btn" for="event-type-toggle-create">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
            </label>
            <input class="event__type-toggle visually-hidden" id="event-type-toggle-create" type="checkbox">
            <div class="event__type-list">
              <fieldset class="event__type-group">
                <legend class="visually-hidden">Event type</legend>
                ${createTypeListTemplate(type)}
              </fieldset>
            </div>
          </div>

          <div class="event__field-group event__field-group--destination">
            <label class="event__label event__type-output" for="event-destination-create">${typeName}</label>
            <input
              class="event__input event__input--destination"
              id="event-destination-create"
              type="text"
              name="event-destination"
              value="${destinationData?.name ?? ''}"
              list="destination-list-create"
              placeholder="Select destination"
            >
            <datalist id="destination-list-create">${destinationOptions}</datalist>
          </div>

          <div class="event__field-group event__field-group--time">
            <label class="visually-hidden" for="event-start-time-create">From</label>
            <input class="event__input event__input--time" id="event-start-time-create" type="text" name="event-start-time" value="${dateFrom ?? ''}">
            &mdash;
            <label class="visually-hidden" for="event-end-time-create">To</label>
            <input class="event__input event__input--time" id="event-end-time-create" type="text" name="event-end-time" value="${dateTo ?? ''}">
          </div>

          <div class="event__field-group event__field-group--price">
            <label class="event__label" for="event-price-create">
              <span class="visually-hidden">Price</span>&euro;
            </label>
            <input
              class="event__input event__input--price"
              id="event-price-create"
              type="text"
              name="event-price"
              value=""
              inputmode="numeric"
            >
          </div>

          <button class="event__save-btn btn btn--blue" type="submit">Save</button>
          <button class="event__reset-btn" type="reset">Cancel</button>
        </header>

        <section class="event__details">
          ${createOffersTemplate(offersByType)}
          ${createDestinationTemplate(destinationData)}
        </section>
      </form>
    </li>`;
}

// ── Класс ────────────────────────────────────────────────────────────────────

export default class CreationFormView extends AbstractStatefulView {
  #allOffers = null;
  #allDestinations = null;
  #onCancelButtonClick = null;
  #onSubmitButtonClick = null;
  #datepickerFrom = null;
  #datepickerTo = null;

  constructor({ allOffers, allDestinations, onCancelButtonClick, onSubmitButtonClick }) {
    super();
    this.#allOffers = allOffers;
    this.#allDestinations = allDestinations;
    this.#onCancelButtonClick = onCancelButtonClick;
    this.#onSubmitButtonClick = onSubmitButtonClick;

    this._state = CreationFormView.createDefaultState(allOffers);
    this.#setEventListeners();
  }

  get template() {
    return createCreationFormTemplate(this._state, this.#allDestinations);
  }

  _restoreHandlers() {
    this.#setEventListeners();
  }

  removeElement() {
    super.removeElement();
    this.#destroyDatepickers();
  }

  #setEventListeners() {
    this.element
      .querySelector('.event.event--edit')
      .addEventListener('submit', this.#submitHandler);

    this.element
      .querySelector('.event__reset-btn')
      .addEventListener('click', this.#cancelHandler);

    this.element
      .querySelector('.event__type-group')
      .addEventListener('change', this.#typeChangeHandler);

    this.element
      .querySelector('.event__input--destination')
      .addEventListener('change', this.#destinationChangeHandler);

    this.element
      .querySelector('.event__input--price')
      .addEventListener('input', this.#priceInputHandler);

    this.#setDatepickers();
  }

  #setDatepickers() {
    this.#destroyDatepickers();

    const commonConfig = { dateFormat: 'd/m/y H:i', enableTime: true, 'time_24hr': true };

    this.#datepickerFrom = flatpickr(
      this.element.querySelector('#event-start-time-create'),
      {
        ...commonConfig,
        defaultDate: this._state.dateFrom ?? null,
        onClose: ([date]) => {
          if (!date) { return; }
          this._setState({ dateFrom: date.toISOString() });
          this.#datepickerTo?.set('minDate', date);
        },
      },
    );

    this.#datepickerTo = flatpickr(
      this.element.querySelector('#event-end-time-create'),
      {
        ...commonConfig,
        defaultDate: this._state.dateTo ?? null,
        minDate: this._state.dateFrom ?? null,
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
    const found = this.#allDestinations.find((d) => d.name === evt.target.value.trim());
    if (!found) {
      evt.target.value = this._state.destinationData?.name ?? '';
      return;
    }
    this.updateElement({ destination: found.id, destinationData: found });
  };

  #priceInputHandler = (evt) => {
    evt.target.value = evt.target.value.replace(/\D/g, '');
    this._setState({ basePrice: Number(evt.target.value) });
  };

  #cancelHandler = (evt) => {
    evt.preventDefault();
    this.#onCancelButtonClick();
  };

  #submitHandler = (evt) => {
    evt.preventDefault();
    this.#onSubmitButtonClick(CreationFormView.parseStateToPoint(this._state));
  };

  static createDefaultState(allOffers) {
    const offersByType = allOffers.find((o) => o.type === DEFAULT_TYPE)
      ?? { type: DEFAULT_TYPE, offers: [] };

    return {
      type: DEFAULT_TYPE,
      destination: null,
      destinationData: null,
      dateFrom: null,
      dateTo: null,
      basePrice: 0,
      offers: [],
      isFavorite: false,
      offersByType,
    };
  }

  static parseStateToPoint(state) {
    const point = { ...state };
    delete point.offersByType;
    delete point.destinationData;
    return point;
  }
}
