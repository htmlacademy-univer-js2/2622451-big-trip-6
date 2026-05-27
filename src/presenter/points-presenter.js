import CreationFormView from '../view/creation-form-view';
import ListFilterView from '../view/list-filter-view';
import ListSortView from '../view/list-sort-view';
import PointsContainerView from '../view/points-container-view';
import ListMessageView from '../view/list-message';
import { generateFilters } from '../mock/filter';
import { render } from '../framework/render';
import { EMPTY_LIST_MESSAGE, SortType } from '../const';
import PointPresenter from './point-presenter';
import { sortByDay, sortByTime, sortByPrice } from '../utils';

export default class PointsPresenter {
  #pointsContainer = null;
  #filterContainer = null;
  #pointsModel = null;
  #destinationModel = null;
  #offersModel = null;

  #pointsComponent = new PointsContainerView();
  #sortComponent = null;
  #pointPresenters = new Map();
  #pointsModels = [];
  #currentSortType = SortType.DAY;

  constructor({ pointsContainer, filterContainer, pointsModel, destinationModel, offersModel }) {
    this.#pointsContainer = pointsContainer;
    this.#filterContainer = filterContainer;
    this.#pointsModel = pointsModel;
    this.#destinationModel = destinationModel;
    this.#offersModel = offersModel;
  }

  get points() {
    switch (this.#currentSortType) {
      case SortType.DAY:
        return [...this.#pointsModels].sort(sortByDay);
      case SortType.TIME:
        return [...this.#pointsModels].sort(sortByTime);
      case SortType.PRICE:
        return [...this.#pointsModels].sort(sortByPrice);
      default:
        return [...this.#pointsModels].sort(sortByDay);
    }
  }

  init() {
    this.#pointsModels = [...this.#pointsModel.points];

    this.#renderListFilter();
    this.#renderListSort();
    this.#renderPointsContainer();

    if (this.#pointsModels.length === 0) {
      this.#renderListMessage();
      return;
    }

    this.#renderPointsList();
    this.#renderCreationForm();
  }

  #renderListFilter() {
    const filters = generateFilters(this.#pointsModels);
    render(new ListFilterView({ filters }), this.#filterContainer);
  }

  #renderListSort() {
    this.#sortComponent = new ListSortView({
      onSortTypeChange: this.#handleSortTypeChange,
    });
    render(this.#sortComponent, this.#pointsContainer);
  }

  #renderPointsContainer() {
    render(this.#pointsComponent, this.#pointsContainer);
  }

  #renderListMessage() {
    render(new ListMessageView({ message: EMPTY_LIST_MESSAGE }), this.#pointsContainer);
  }

  #renderCreationForm() {
    render(
      new CreationFormView({
        allOffers: this.#offersModel.offers,
        allDestinations: this.#destinationModel.destination,
        onCancelButtonClick: this.#handleCreationFormCancel,
        onSubmitButtonClick: this.#handleCreationFormSubmit,
      }),
      this.#pointsComponent.element,
    );
  }

  #renderPointsList() {
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();

    this.points.forEach((point) => {
      const presenter = new PointPresenter({
        container: this.#pointsComponent.element,
        point,
        offers: [...this.#offersModel.getOffersById(point.type, point.offers)],
        destination: this.#destinationModel.getDestinationById(point.destination),
        allOffers: this.#offersModel.offers,
        allDestinations: this.#destinationModel.destination,
        onDataChange: this.#handlePointChange,
        onModeChange: this.#resetAllViews,
      });

      presenter.init();
      this.#pointPresenters.set(point.id, presenter);
    });
  }

  #resetAllViews = () => {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  };

  #handlePointChange = (updatedPoint) => {
    const index = this.#pointsModels.findIndex((p) => p.id === updatedPoint.id);
    if (index === -1) {
      return;
    }

    this.#pointsModels[index] = updatedPoint;
    this.#pointPresenters.get(updatedPoint.id)?.update(updatedPoint);
  };

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#currentSortType = sortType;
    this.#renderPointsList();
  };

  #handleCreationFormCancel = () => {
    this.#renderPointsList();
  };

  #handleCreationFormSubmit = () => {
    this.#renderPointsList();
  };
}
