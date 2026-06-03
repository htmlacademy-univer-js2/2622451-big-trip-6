export default class DestinationModel {
  #destinations = [];

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
