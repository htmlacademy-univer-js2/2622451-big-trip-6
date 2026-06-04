import AbstractView from '../framework/view/abstract-view.js';
import dayjs from 'dayjs';

/**
 * Форматирует диапазон дат путешествия.
 * Если месяцы совпадают: "Mar 18 — 21", иначе: "Mar 18 — Apr 2"
 */
function formatTripDates(dateFrom, dateTo) {
  if (!dateFrom || !dateTo) { return ''; }
  const from = dayjs(dateFrom);
  const to   = dayjs(dateTo);
  const fromStr = from.format('MMM D');
  const toStr   = from.month() === to.month() ? to.format('D') : to.format('MMM D');
  return `${fromStr}&nbsp;&mdash;&nbsp;${toStr}`;
}

/**
 * Формирует строку маршрута из массива названий городов.
 * До 3 городов: "Oslo — Berlin — Paris"
 * Больше 3: "Oslo — ... — Paris"
 */
function formatRoute(cityNames) {
  if (!cityNames.length) { return ''; }
  if (cityNames.length <= 3) {
    return cityNames.join(' &mdash; ');
  }
  return `${cityNames[0]} &mdash; &hellip; &mdash; ${cityNames[cityNames.length - 1]}`;
}

function createTripInfoTemplate({ route, dates, totalPrice }) {
  return `
    <section class="trip-main__trip-info trip-info">
      <div class="trip-info__main">
        <h1 class="trip-info__title">${route}</h1>
        <p class="trip-info__dates">${dates}</p>
      </div>
      <p class="trip-info__cost">
        Total: &euro;&nbsp;<span class="trip-info__cost-value">${totalPrice}</span>
      </p>
    </section>`;
}

export default class TripInfoView extends AbstractView {
  #route      = '';
  #dates      = '';
  #totalPrice = 0;

  constructor({ route, dates, totalPrice }) {
    super();
    this.#route      = route;
    this.#dates      = dates;
    this.#totalPrice = totalPrice;
  }

  get template() {
    return createTripInfoTemplate({
      route:      this.#route,
      dates:      this.#dates,
      totalPrice: this.#totalPrice,
    });
  }

  /**
   * Статический хелпер: считает данные для шапки из points + модели офферов.
   * Вынесен сюда, чтобы и презентер, и view могли использовать одну логику.
   */
  static calcTripData(points, destinationModel, offersModel) {
    if (!points.length) {
      return { route: '', dates: '', totalPrice: 0 };
    }

    // Сортируем по dateFrom, чтобы маршрут и даты были в хронологическом порядке
    const sorted = [...points].sort(
      (a, b) => new Date(a.dateFrom) - new Date(b.dateFrom),
    );

    // Маршрут — уникальные города в порядке следования
    const cityNames = sorted
      .map((p) => destinationModel.getDestinationById(p.destination)?.name)
      .filter(Boolean);

    const route = formatRoute(cityNames);

    // Даты: от начала первой точки до конца последней
    const dateFrom = sorted[0].dateFrom;
    const dateTo = sorted[sorted.length - 1].dateTo;
    const dates = formatTripDates(dateFrom, dateTo);

    const totalPrice = points.reduce((sum, point) => {
      const offersByType = offersModel.getOffersByType(point.type);
      const selectedTotal = offersByType
        ? offersByType.offers
          .filter((o) => point.offers.includes(o.id))
          .reduce((s, o) => s + o.price, 0)
        : 0;
      return sum + point.basePrice + selectedTotal;
    }, 0);

    return { route, dates, totalPrice };
  }
}
