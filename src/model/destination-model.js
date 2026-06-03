export default class DestinationModel {
  #destinations = [];

  /** Вызывается из main.js после загрузки с сервера */
  init(destinations) {
    this.#destinations = destinations;
  }

  get destination() {
    return this.#destinations;
  }

  getDestinationById(id) {
    return this.#destinations.find((item) => item.id === id) ?? null;
  }
}
