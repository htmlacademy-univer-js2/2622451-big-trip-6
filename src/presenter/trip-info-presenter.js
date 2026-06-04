import { render, remove, RenderPosition } from '../framework/render.js';
import TripInfoView from '../view/trip-info-view.js';
import { UpdateType } from '../const.js';

/**
 * Презентер информации о путешествии в шапке.
 * Следит за pointsModel и перерисовывает блок при любом изменении точек.
 */
export default class TripInfoPresenter {
  #tripInfoContainer  = null;   // .trip-main
  #pointsModel        = null;
  #destinationModel   = null;
  #offersModel        = null;
  #tripInfoComponent  = null;

  constructor({ tripInfoContainer, pointsModel, destinationModel, offersModel }) {
    this.#tripInfoContainer = tripInfoContainer;
    this.#pointsModel       = pointsModel;
    this.#destinationModel  = destinationModel;
    this.#offersModel       = offersModel;

    this.#pointsModel.addObserver(this.#handleModelEvent);
  }

  init() {
    this.#renderTripInfo();
  }

  // ── Приватные методы ─────────────────────────────────────────────────────

  #renderTripInfo() {
    const tripData = TripInfoView.calcTripData(
      this.#pointsModel.points,
      this.#destinationModel,
      this.#offersModel,
    );

    const prevComponent = this.#tripInfoComponent;

    this.#tripInfoComponent = new TripInfoView(tripData);

    if (prevComponent === null) {
      // Первый рендер — вставляем перед кнопкой «New Event» (AFTERBEGIN в .trip-main)
      render(this.#tripInfoComponent, this.#tripInfoContainer, RenderPosition.AFTERBEGIN);
      return;
    }

    // Перерисовка — заменяем старый блок новым
    const parent = prevComponent.element.parentElement;
    parent.replaceChild(this.#tripInfoComponent.element, prevComponent.element);
    remove(prevComponent);
  }

  /**
   * Реагируем на PATCH, MINOR и MAJOR — любое из них меняет точки,
   * а значит может измениться маршрут, даты или стоимость.
   */
  #handleModelEvent = (updateType) => {
    if (
      updateType === UpdateType.PATCH ||
      updateType === UpdateType.MINOR ||
      updateType === UpdateType.MAJOR
    ) {
      this.#renderTripInfo();
    }
  };
}
