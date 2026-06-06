import he from 'he';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import {
  createTypeListTemplate,
  createOffersTemplate,
  createDestinationTemplate,
  isSaveDisabled,
} from './form-helpers.js';

const DEFAULT_TYPE = 'flight';
const FORM_ID_SUFFIX = 'create';

function createCreationFormTemplate(state, allDestinations) {
  const {
    type, dateFrom, dateTo, offers,
    offersByType, destinationData,
    isDisabled, isSaving,
  } = state;

  const typeName = type[0].toUpperCase() + type.slice(1);
  const destinationOptions = allDestinations
    .map((destination) => `<option value="${he.encode(destination.name)}"></option>`)
    .join('');

  return `
    <li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">

          <div class="event__type-wrapper">
            <label class="event__type event__type-btn" for="event-type-toggle-${FORM_ID_SUFFIX}">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
            </label>
            <input
              class="event__type-toggle visually-hidden"
              id="event-type-toggle-${FORM_ID_SUFFIX}"
              type="checkbox"
              ${isDisabled ? 'disabled' : ''}
            >
            <div class="event__type-list">
              <fieldset class="event__type-group">
                <legend class="visually-hidden">Event type</legend>
                ${createTypeListTemplate(type, FORM_ID_SUFFIX)}
              </fieldset>
            </div>
          </div>

          <div class="event__field-group event__field-group--destination">
            <label class="event__label event__type-output" for="event-destination-${FORM_ID_SUFFIX}">
              ${typeName}
            </label>
            <input
              class="event__input event__input--destination"
              id="event-destination-${FORM_ID_SUFFIX}"
              type="text"
              name="event-destination"
              value="${he.encode(destinationData?.name ?? '')}"
              list="destination-list-${FORM_ID_SUFFIX}"
              placeholder="Select destination"
              ${isDisabled ? 'disabled' : ''}
            >
            <datalist id="destination-list-${FORM_ID_SUFFIX}">${destinationOptions}</datalist>
          </div>

          <div class="event__field-group event__field-group--time">
            <label class="visually-hidden" for="event-start-time-${FORM_ID_SUFFIX}">From</label>
            <input
              class="event__input event__input--time"
              id="event-start-time-${FORM_ID_SUFFIX}"
              type="text"
              name="event-start-time"
              value="${dateFrom ?? ''}"
              ${isDisabled ? 'disabled' : ''}
            >
            &mdash;
            <label class="visually-hidden" for="event-end-time-${FORM_ID_SUFFIX}">To</label>
            <input
              class="event__input event__input--time"
              id="event-end-time-${FORM_ID_SUFFIX}"
              type="text"
              name="event-end-time"
              value="${dateTo ?? ''}"
              ${isDisabled ? 'disabled' : ''}
            >
          </div>

          <div class="event__field-group event__field-group--price">
            <label class="event__label" for="event-price-${FORM_ID_SUFFIX}">
              <span class="visually-hidden">Price</span>&euro;
            </label>
            <input
              class="event__input event__input--price"
              id="event-price-${FORM_ID_SUFFIX}"
              type="text"
              name="event-price"
              value="${state.basePrice > 0 ? state.basePrice : 0}"
              inputmode="numeric"
              ${isDisabled ? 'disabled' : ''}
            >
          </div>

          <button
            class="event__save-btn btn btn--blue"
            type="submit"
            ${isSaveDisabled(state) ? 'disabled' : ''}
          >
            ${isSaving ? 'Saving...' : 'Save'}
          </button>
          <button class="event__reset-btn" type="reset">Cancel</button>
        </header>

        <section class="event__details">
          ${createOffersTemplate(offersByType, offers, FORM_ID_SUFFIX)}
          ${createDestinationTemplate(destinationData)}
        </section>
      </form>
    </li>`;
}

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

  setSaving() {
    this.updateElement({ isDisabled: true, isSaving: true });
  }

  setAborting() {
    this.updateElement({ isDisabled: false, isSaving: false });
    this.shake();
  }

  #setEventListeners() {
    this.element.querySelector('.event.event--edit').addEventListener('submit', this.#submitHandler);
    this.element.querySelector('.event__reset-btn').addEventListener('click', this.#cancelHandler);
    this.element.querySelector('.event__type-group').addEventListener('change', this.#typeChangeHandler);
    this.element.querySelector('.event__input--destination').addEventListener('change', this.#destinationChangeHandler);
    this.element.querySelector('.event__input--price').addEventListener('input', this.#priceInputHandler);

    const offersContainer = this.element.querySelector('.event__available-offers');
    if (offersContainer) {
      offersContainer.addEventListener('change', this.#offersChangeHandler);
    }

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
      this.element.querySelector(`#event-start-time-${FORM_ID_SUFFIX}`),
      {
        ...commonConfig,
        defaultDate: this._state.dateFrom ?? null,
        onClose: ([date]) => {
          if (!date) {
            return;
          }
          this._setState({ dateFrom: date.toISOString() });
          this.#datepickerTo?.set('minDate', date);
          this.#updateSaveButton();
        },
      },
    );

    this.#datepickerTo = flatpickr(
      this.element.querySelector(`#event-end-time-${FORM_ID_SUFFIX}`),
      {
        ...commonConfig,
        defaultDate: this._state.dateTo ?? null,
        minDate: this._state.dateFrom ?? null,
        onClose: ([date]) => {
          if (!date) {
            return;
          }
          this._setState({ dateTo: date.toISOString() });
          this.#updateSaveButton();
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

  #updateSaveButton() {
    const saveButton = this.element.querySelector('.event__save-btn');
    if (saveButton) {
      saveButton.disabled = isSaveDisabled(this._state);
    }
  }

  #typeChangeHandler = (evt) => {
    if (evt.target.tagName !== 'INPUT') {
      return;
    }
    this.updateElement({
      type: evt.target.value,
      offers: [],
      offersByType: this.#allOffers.find((offer) => offer.type === evt.target.value)
        ?? { type: evt.target.value, offers: [] },
    });
  };

  #destinationChangeHandler = (evt) => {
    const value = evt.target.value.trim();
    const found = this.#allDestinations.find((destination) => destination.name === value);

    if (!found) {
      this.updateElement({
        destination: null,
        destinationData: value ? { name: value, description: '', pictures: [] } : null,
      });
      return;
    }

    this.updateElement({ destination: found.id, destinationData: found });
  };

  #priceInputHandler = (evt) => {
    evt.target.value = evt.target.value.replace(/\D/g, '');
    this._setState({ basePrice: Number(evt.target.value) });
    this.#updateSaveButton();
  };

  #offersChangeHandler = () => {
    const checkedOffers = [
      ...this.element.querySelectorAll('.event__offer-checkbox:checked'),
    ].map((checkbox) => checkbox.dataset.offerId);
    this._setState({ offers: checkedOffers });
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
    const offersByType = allOffers.find((offer) => offer.type === DEFAULT_TYPE)
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
      isDisabled: false,
      isSaving: false,
    };
  }

  static parseStateToPoint(state) {
    const point = { ...state };
    delete point.offersByType;
    delete point.destinationData;
    delete point.isDisabled;
    delete point.isSaving;
    return point;
  }
}
