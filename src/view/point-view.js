import AbstractView from '../framework/view/abstract-view';
import { dateDiff, humanizeTaskDueDate, humanizeTaskDueTime } from '../utils.js';

function createPointTemplate(point, offers, destination) {
  const { basePrice, dateFrom, dateTo, isFavorite, type} = point;

  const typeName = type[0].toUpperCase() + type.slice(1, type.length);

  const createEventOfferTemplate = (title, price) => `
    <li class="event__offer">
      <span class="event__offer-title">${title}</span>
      &plus;&euro;&nbsp;
      <span class="event__offer-price">${price}</span>
    </li>`;

  const createEventOffers = offers
    .map((offer) => createEventOfferTemplate(offer.title, offer.price)).join('');

  const favoriteClassName = isFavorite
    ? 'event__favorite-btn event__favorite-btn--active'
    : 'event__favorite-btn';

  return (
    `<li class="trip-events__item">
      <div class="event">
        <time class="event__date" datetime="2019-03-18">${humanizeTaskDueDate(dateFrom)}</time>
        <div class="event__type">
          <img class="event__type-icon" width="42" height="42" src="img/icons/${type}.png" alt="Event type icon">
        </div>
        <h3 class="event__title">${typeName} ${destination.name}</h3>
        <div class="event__schedule">
          <p class="event__time">
            <time class="event__start-time" datetime="${dateFrom.slice(0,18)}">${humanizeTaskDueTime(dateFrom)}</time>
            &mdash;
            <time class="event__end-time" datetime="${dateTo.slice(0,18)}">${humanizeTaskDueTime(dateTo)}</time>
          </p>
          <p class="event__duration">${dateDiff(dateFrom, dateTo)}</p>
        </div>
        <p class="event__price">
          &euro;&nbsp;<span class="event__price-value">${basePrice}</span>
        </p>
        <h4 class="visually-hidden">Offers:</h4>
        <ul class="event__selected-offers">
          ${createEventOffers}
        </ul>
        <button class="${favoriteClassName}" type="button">
          <span class="visually-hidden">Add to favorite</span>
          <svg class="event__favorite-icon" width="28" height="28" viewBox="0 0 28 28">
            <path d="M14 21l-8.22899 4.3262 1.57159-9.1631L.685209 9.67376 9.8855 8.33688 14 0l4.1145 8.33688 9.2003 1.33688-6.6574 6.48934 1.5716 9.1631L14 21z"/>
          </svg>
        </button>
        <button class="event__rollup-btn" type="button">
          <span class="visually-hidden">Open event</span>
        </button>
      </div>
    </li>`
  );
}

export default class PointView extends AbstractView{

  #point = null;
  #offers = null;
  #destination = null;
  #onOpenRedactionButtonClick = null;
  #onFavoriteClick = null;

  constructor({point, offers, destination, onOpenRedactionButtonClick, onFavoriteClick}) {
    super();
    this.#point = point;
    this.#offers = offers;
    this.#destination = destination;
    this.#onOpenRedactionButtonClick = onOpenRedactionButtonClick;
    this.#onFavoriteClick = onFavoriteClick;
    this.#setEventListeners();
  }

  get template() {
    return createPointTemplate(this.#point, this.#offers, this.#destination);
  }

  #setEventListeners() {
    this.element
      .querySelector('.event__rollup-btn')
      .addEventListener('click', this.#openRedactionButtonClickHandler);

    this.element
      .querySelector('.event__favorite-btn')
      .addEventListener('click', this.#favoriteClickHandler);
  }

  #openRedactionButtonClickHandler = (evt) => {
    evt.preventDefault(evt);
    this.#onOpenRedactionButtonClick();
  };

  #favoriteClickHandler = (evt) => {
    evt.preventDefault();
    this.#onFavoriteClick();
  };
}
