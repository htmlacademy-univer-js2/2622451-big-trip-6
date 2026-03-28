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

  constructor({pointsContainer, filterContainer, pointsModel, destinationModel, offersModel}) {
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

  renderListFilter(pointsModel){
    const filters = generateFilters(pointsModel);
    render(new ListFilterView({filters}), this.#filterContainer);
  }

  renderListSort(){
    this.#sortComponent = new ListSortView({
      onSortTypeChange: this.#handleSortTypeChange
    });
    render(this.#sortComponent, this.#pointsContainer);
  }

  renderPointsContainer(){
    render(this.#pointsComponent, this.#pointsContainer);
  }

  renderListMessage(){
    render(new ListMessageView({message: EMPTY_LIST_MESSAGE}), this.#pointsContainer);
  }

  renderCreationForm(){
    const lastPoint = this.#pointsModels.at(-1);

    const creationForm = new CreationFormView({
      point: lastPoint,
      offersByType: this.#offersModel.getOffersByType(lastPoint.type),
      destination: this.#destinationModel.getDestinationById(lastPoint.destination)
    });

    render(creationForm, this.#pointsComponent.element);
  }

  resetAllViews() {
    this.#pointPresenters.forEach((presenter) => {
      presenter.resetView();
    });
  }

  handlePointChange = (updatedPoint) => {
    const index = this.#pointsModels.findIndex((p) => p.id === updatedPoint.id);
    if (index === -1) {
      return;
    }

    this.#pointsModels[index] = updatedPoint;
    const presenter = this.#pointPresenters.get(updatedPoint.id);
    presenter.update(updatedPoint);
  };

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#currentSortType = sortType;
    this.#renderPointsList();
  };

  #renderPointsList() {
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();

    this.points.forEach((point) => {
      const presenter = new PointPresenter({
        container: this.#pointsComponent.element,
        point,
        offers: [...this.#offersModel.getOffersById(point.type, point.offers)],
        offersByType: this.#offersModel.getOffersByType(point.type),
        destination: this.#destinationModel.getDestinationById(point.destination),
        onDataChange: this.handlePointChange,
        onModeChange: () => this.resetAllViews(),
      });

      presenter.init();
      this.#pointPresenters.set(point.id, presenter);
    });
  }

  init() {
    this.#pointsModels = [...this.#pointsModel.points];

    this.renderListFilter(this.#pointsModels);
    this.renderListSort();
    this.renderPointsContainer();

    if (this.#pointsModels.length === 0){
      this.renderListMessage();
      return;
    }

    this.points.forEach((point) => {
      const presenter = new PointPresenter({
        container: this.#pointsComponent.element,
        point,
        offers: [...this.#offersModel.getOffersById(point.type, point.offers)],
        offersByType: this.#offersModel.getOffersByType(point.type),
        destination: this.#destinationModel.getDestinationById(point.destination),
        onDataChange: this.handlePointChange,
        onModeChange: () => this.resetAllViews(),
      });

      presenter.init();
      this.#pointPresenters.set(point.id, presenter);
    });

    this.renderCreationForm();
  }
}

