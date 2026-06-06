import { render, replace, remove, RenderPosition } from '../framework/render.js';
import TripInfoView from '../view/trip-info-view.js';

export default class TripInfoPresenter {
  #tripInfoContainer = null;
  #pointsModel = null;
  #destinationModel = null;
  #offersModel = null;
  #tripInfoComponent = null;

  constructor({ tripInfoContainer, pointsModel, destinationModel, offersModel }) {
    this.#tripInfoContainer = tripInfoContainer;
    this.#pointsModel = pointsModel;
    this.#destinationModel = destinationModel;
    this.#offersModel = offersModel;

    this.#pointsModel.addObserver(this.#handleModelEvent);
  }

  init() {
    this.#renderTripInfo();
  }

  #renderTripInfo() {
    const prevComponent = this.#tripInfoComponent;

    if (this.#pointsModel.points.length === 0) {
      if (prevComponent) {
        remove(prevComponent);
        this.#tripInfoComponent = null;
      }
      return;
    }

    const tripData = TripInfoView.calcTripData(
      this.#pointsModel.points,
      this.#destinationModel,
      this.#offersModel,
    );

    this.#tripInfoComponent = new TripInfoView(tripData);

    if (prevComponent === null) {
      render(this.#tripInfoComponent, this.#tripInfoContainer, RenderPosition.AFTERBEGIN);
      return;
    }

    replace(this.#tripInfoComponent, prevComponent);
    remove(prevComponent);
  }

  #handleModelEvent = () => {
    this.#renderTripInfo();
  };
}
