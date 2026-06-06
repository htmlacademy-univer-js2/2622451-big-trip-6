import he from 'he';
import { EventType } from '../const.js';

function createTypeListTemplate(currentType, idSuffix) {
  return EventType.map((type) => `
    <div class="event__type-item">
      <input
        id="event-type-${type}-${idSuffix}"
        class="event__type-input visually-hidden"
        type="radio" name="event-type" value="${type}"
        ${currentType === type ? 'checked' : ''}
      >
      <label class="event__type-label event__type-label--${type}" for="event-type-${type}-${idSuffix}">
        ${type[0].toUpperCase() + type.slice(1)}
      </label>
    </div>`).join('');
}

function createOffersTemplate(offersByType, selectedIds, idSuffix) {
  if (!offersByType?.offers?.length) {
    return '';
  }
  return `
    <section class="event__section event__section--offers">
      <h3 class="event__section-title event__section-title--offers">Offers</h3>
      <div class="event__available-offers">
        ${offersByType.offers.map((offer) => `
          <div class="event__offer-selector">
            <input
              class="event__offer-checkbox visually-hidden"
              id="event-offer-${idSuffix}-${offer.id}"
              type="checkbox"
              name="event-offer-${he.encode(offer.title)}"
              data-offer-id="${offer.id}"
              ${selectedIds.includes(offer.id) ? 'checked' : ''}
            >
            <label class="event__offer-label" for="event-offer-${idSuffix}-${offer.id}">
              <span class="event__offer-title">${he.encode(offer.title)}</span>
              &plus;&euro;&nbsp;
              <span class="event__offer-price">${he.encode(String(offer.price))}</span>
            </label>
          </div>`).join('')}
      </div>
    </section>`;
}

function createDestinationTemplate(destinationData) {
  if (!destinationData?.description) {
    return '';
  }

  const photos = destinationData.pictures?.length
    ? `<div class="event__photos-container">
        <div class="event__photos-tape">
          ${destinationData.pictures.map((picture) => `
            <img
              class="event__photo"
              src="${he.encode(picture.src)}"
              alt="${he.encode(picture.description)}"
            >`).join('')}
        </div>
      </div>`
    : '';

  return `
    <section class="event__section event__section--destination">
      <h3 class="event__section-title event__section-title--destination">Destination</h3>
      <p class="event__destination-description">${he.encode(destinationData.description)}</p>
      ${photos}
    </section>`;
}

function isSaveDisabled(state) {
  return (
    state.isDisabled ||
    !state.destination ||
    !state.dateFrom ||
    !state.dateTo ||
    state.basePrice <= 0
  );
}

export { createTypeListTemplate, createOffersTemplate, createDestinationTemplate, isSaveDisabled };
