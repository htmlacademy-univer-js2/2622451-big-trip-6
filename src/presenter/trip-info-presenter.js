import { render, remove, RenderPosition } from '../framework/render.js';
import TripInfoView from '../view/trip-info-view.js';
import { UpdateType } from '../const.js';

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
    const tripData = TripInfoView.calcTripData(
      this.#pointsModel.points,
      this.#destinationModel,
      this.#offersModel,
    );

    const prevComponent = this.#tripInfoComponent;

    this.#tripInfoComponent = new TripInfoView(tripData);

    if (prevComponent === null) {
      render(this.#tripInfoComponent, this.#tripInfoContainer, RenderPosition.AFTERBEGIN);
      return;
    }

    const parent = prevComponent.element.parentElement;
    parent.replaceChild(this.#tripInfoComponent.element, prevComponent.element);
    remove(prevComponent);
  }

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
