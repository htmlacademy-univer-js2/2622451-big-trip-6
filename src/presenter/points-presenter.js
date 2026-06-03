import { render, remove } from '../framework/render.js';
import PointsContainerView from '../view/points-container-view.js';
import ListSortView from '../view/list-sort-view.js';
import ListMessageView from '../view/list-message.js';
import PointPresenter from './point-presenter.js';
import NewPointPresenter from './new-point-presenter.js';
import { SortType, UserAction, UpdateType, FilterType, EMPTY_LIST_MESSAGES } from '../const.js';
import { sortByDay, sortByTime, sortByPrice } from '../utils.js';
import { filter } from '../filter.js';

const LoadingState = {
  LOADING: 'LOADING',
  LOADED: 'LOADED',
  ERROR: 'ERROR',
};

const LOADING_MESSAGE = 'Loading…';
const ERROR_MESSAGE = 'Failed to load trip data. Please try again later.';

export default class PointsPresenter {
  #pointsContainer = null;
  #pointsModel = null;
  #filterModel = null;
  #offersModel = null;
  #destinationModel = null;
  #onNewPointDestroy = null;

  #pointsComponent = new PointsContainerView();
  #sortComponent = null;
  #messageComponent = null;
  #newPointPresenter = null;
  #pointPresenters = new Map();
  #currentSortType = SortType.DAY;
  #loadingState = LoadingState.LOADING;

  constructor({
    pointsContainer, pointsModel, filterModel,
    destinationModel, offersModel, onNewPointDestroy,
  }) {
    this.#pointsContainer = pointsContainer;
    this.#pointsModel = pointsModel;
    this.#filterModel = filterModel;
    this.#destinationModel = destinationModel;
    this.#offersModel = offersModel;
    this.#onNewPointDestroy = onNewPointDestroy;

    this.#pointsModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);
  }

  get #filteredPoints() {
    return filter[this.#filterModel.filter](this.#pointsModel.points);
  }

  get #sortedPoints() {
    switch (this.#currentSortType) {
      case SortType.TIME: return [...this.#filteredPoints].sort(sortByTime);
      case SortType.PRICE: return [...this.#filteredPoints].sort(sortByPrice);
      default: return [...this.#filteredPoints].sort(sortByDay);
    }
  }

  init() {
    render(this.#pointsComponent, this.#pointsContainer);
    this.#renderBoard();
  }

  onDataLoaded() {
    this.#newPointPresenter = this.#buildNewPointPresenter();
    this.#loadingState = LoadingState.LOADED;
    this.#clearBoard();
    this.#renderBoard();
  }

  onDataError() {
    this.#loadingState = LoadingState.ERROR;
    this.#clearBoard();
    this.#renderBoard();
  }

  createPoint() {
    this.#currentSortType = SortType.DAY;
    this.#filterModel.setFilter(UpdateType.MAJOR, FilterType.EVERYTHING);
    this.#newPointPresenter?.init();
  }

  #buildNewPointPresenter() {
    return new NewPointPresenter({
      pointsContainer: this.#pointsComponent.element,
      allOffers:       this.#offersModel.offers,
      allDestinations: this.#destinationModel.destination,
      onDataChange:    this.#handleViewAction,
      onDestroy:       this.#onNewPointDestroy,
    });
  }

  #renderBoard() {
    if (this.#loadingState === LoadingState.LOADING) {
      this.#renderMessage(LOADING_MESSAGE);
      return;
    }
    if (this.#loadingState === LoadingState.ERROR) {
      this.#renderMessage(ERROR_MESSAGE);
      return;
    }
    if (this.#sortedPoints.length === 0) {
      this.#renderMessage(EMPTY_LIST_MESSAGES[this.#filterModel.filter]);
      return;
    }
    this.#renderSort();
    this.#renderPointsList();
  }

  #renderSort() {
    this.#sortComponent = new ListSortView({
      currentSortType:  this.#currentSortType,
      onSortTypeChange: this.#handleSortTypeChange,
    });
    render(this.#sortComponent, this.#pointsContainer, 'afterbegin');
  }

  #renderMessage(message) {
    this.#messageComponent = new ListMessageView({ message });
    render(this.#messageComponent, this.#pointsContainer);
  }

  #renderPointsList() {
    this.#sortedPoints.forEach((point) => this.#renderPoint(point));
  }

  #renderPoint(point) {
    const presenter = new PointPresenter({
      container:       this.#pointsComponent.element,
      point,
      offers:          [...this.#offersModel.getOffersById(point.type, point.offers)],
      destination:     this.#destinationModel.getDestinationById(point.destination),
      allOffers:       this.#offersModel.offers,
      allDestinations: this.#destinationModel.destination,
      onDataChange:    this.#handleViewAction,
      onModeChange:    this.#handleModeChange,
    });
    presenter.init();
    this.#pointPresenters.set(point.id, presenter);
  }

  #clearBoard({ resetSortType = false } = {}) {
    this.#newPointPresenter?.destroy();
    this.#pointPresenters.forEach((p) => p.destroy());
    this.#pointPresenters.clear();

    if (this.#sortComponent) {
      remove(this.#sortComponent);
      this.#sortComponent = null;
    }
    if (this.#messageComponent) {
      remove(this.#messageComponent);
      this.#messageComponent = null;
    }
    if (resetSortType) {
      this.#currentSortType = SortType.DAY;
    }
  }

  #handleViewAction = async (actionType, updateType, update) => {
    switch (actionType) {

      case UserAction.UPDATE_POINT: {
        const presenter = this.#pointPresenters.get(update.id);
        presenter?.setSaving();
        try {
          await this.#pointsModel.updatePoint(updateType, update);
        } catch {
          presenter?.setAborting();
        }
        break;
      }

      case UserAction.ADD_POINT: {
        this.#newPointPresenter?.setSaving();
        try {
          await this.#pointsModel.addPoint(updateType, update);
        } catch {
          this.#newPointPresenter?.setAborting();
        }
        break;
      }

      case UserAction.DELETE_POINT: {
        const presenter = this.#pointPresenters.get(update.id);
        presenter?.setDeleting();
        try {
          await this.#pointsModel.deletePoint(updateType, update);
        } catch {
          presenter?.setAborting();
        }
        break;
      }
    }
  };

  #handleModelEvent = (updateType, data) => {
    switch (updateType) {
      case UpdateType.PATCH:
        this.#pointPresenters.get(data.id)?.update(data);
        break;
      case UpdateType.MINOR:
        this.#clearBoard();
        this.#renderBoard();
        break;
      case UpdateType.MAJOR:
        this.#clearBoard({ resetSortType: true });
        this.#renderBoard();
        break;
    }
  };

  #handleModeChange = () => {
    this.#newPointPresenter?.destroy();
    this.#pointPresenters.forEach((p) => p.resetView());
  };

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }
    this.#currentSortType = sortType;
    this.#clearBoard();
    this.#renderBoard();
  };
}
