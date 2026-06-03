export default class OffersModel {
  #offers = [];

  init(offers) {
    this.#offers = offers;
  }

  get offers() {
    return this.#offers;
  }

  getOffersByType(type) {
    return this.#offers.find((item) => item.type === type) ?? null;
  }

  getOffersById(type, itemsId) {
    const offersByType = this.getOffersByType(type);
    if (!offersByType) {
      return [];
    }
    return offersByType.offers.filter((item) => itemsId.includes(item.id));
  }
}
