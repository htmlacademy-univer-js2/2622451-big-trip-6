import AbstractView from '../framework/view/abstract-view.js';

function createListMessageTemplate(message) {
  return `<p class="trip-events__msg">${message}</p>`;
}

export default class ListMessageView extends AbstractView {
  #message = null;

  constructor({ message }) {
    super();
    this.#message = message;
  }

  get template() {
    return createListMessageTemplate(this.#message);
  }
}
