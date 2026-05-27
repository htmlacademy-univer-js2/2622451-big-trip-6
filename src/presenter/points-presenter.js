import { render, remove } from '../framework/render';
import PointsContainerView from '../view/points-container-view';
import ListSortView from '../view/list-sort-view';
import ListMessageView from '../view/list-message';
import PointPresenter from './point-presenter';
import NewPointPresenter from './new-point-presenter';
import { SortType, UserAction, UpdateType, FilterType, EMPTY_LIST_MESSAGES } from '../const';
import { sortByDay, sortByTime, sortByPrice } from '../utils';
import { filter } from '../filter';

export default class PointsPresenter {
  #pointsContainer = null;
  #pointsModel = null;
  #filterModel = null;
  #offersModel = null;
  #destinationModel = null;

  #pointsComponent = new PointsContainerView();
  #sortComponent = null;
  #messageComponent = null;
  #newPointPresenter = null;
  #pointPresenters = new Map();
  #currentSortType = SortType.DAY;

  constructor({
    pointsContainer, pointsModel, filterModel,
    destinationModel, offersModel, onNewPointDestroy,
  }) {
    this.#pointsContainer = pointsContainer;
    this.#pointsModel = pointsModel;
    this.#filterModel = filterModel;
    this.#destinationModel = destinationModel;
    this.#offersModel = offersModel;

    this.#newPointPresenter = new NewPointPresenter({
      // ul рендерится позже, передадим element через геттер
      pointsContainer: this.#pointsComponent.element,
      allOffers: this.#offersModel.offers,
      allDestinations: this.#destinationModel.destination,
      onDataChange: this.#handleViewAction,
      onDestroy: onNewPointDestroy,
    });

    this.#pointsModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);
  }

  get #filteredPoints() {
    return filter[this.#filterModel.filter](this.#pointsModel.points);
  }

  get #sortedPoints() {
    switch (this.#currentSortType) {
      case SortType.TIME:  return [...this.#filteredPoints].sort(sortByTime);
      case SortType.PRICE: return [...this.#filteredPoints].sort(sortByPrice);
      default:             return [...this.#filteredPoints].sort(sortByDay);
    }
  }

  init() {
    render(this.#pointsComponent, this.#pointsContainer);
    this.#renderBoard();
  }

  /** Вызывается из main.js по кнопке «New Event» */
  createPoint() {
    // Сбрасываем фильтр и сортировку (MAJOR перерисует доску)
    this.#currentSortType = SortType.DAY;
    this.#filterModel.setFilter(UpdateType.MAJOR, FilterType.EVERYTHING);
    // Инициализируем форму создания (после перерисовки доски)
    this.#newPointPresenter.init();
  }

  // ── Рендеринг ─────────────────────────────────────────────────────────────

  #renderBoard() {
    if (this.#sortedPoints.length === 0) {
      this.#renderMessage();
      return;
    }
    this.#renderSort();
    this.#renderPointsList();
  }

  #renderSort() {
    this.#sortComponent = new ListSortView({
      currentSortType: this.#currentSortType,
      onSortTypeChange: this.#handleSortTypeChange,
    });
    // Сортировка идёт перед ul в trip-events
    render(this.#sortComponent, this.#pointsContainer, 'afterbegin');
  }

  #renderMessage() {
    this.#messageComponent = new ListMessageView({
      message: EMPTY_LIST_MESSAGES[this.#filterModel.filter],
    });
    render(this.#messageComponent, this.#pointsContainer);
  }

  #renderPointsList() {
    this.#sortedPoints.forEach((point) => this.#renderPoint(point));
  }

  #renderPoint(point) {
    const presenter = new PointPresenter({
      container: this.#pointsComponent.element,
      point,
      offers: [...this.#offersModel.getOffersById(point.type, point.offers)],
      destination: this.#destinationModel.getDestinationById(point.destination),
      allOffers: this.#offersModel.offers,
      allDestinations: this.#destinationModel.destination,
      onDataChange: this.#handleViewAction,
      onModeChange: this.#handleModeChange,
    });

    presenter.init();
    this.#pointPresenters.set(point.id, presenter);
  }

  #clearBoard({ resetSortType = false } = {}) {
    this.#newPointPresenter.destroy();
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

  // ── Обработчики ──────────────────────────────────────────────────────────

  #handleViewAction = (actionType, updateType, update) => {
    switch (actionType) {
      case UserAction.UPDATE_POINT:
        this.#pointsModel.updatePoint(updateType, update);
        break;
      case UserAction.ADD_POINT:
        this.#pointsModel.addPoint(updateType, update);
        break;
      case UserAction.DELETE_POINT:
        this.#pointsModel.deletePoint(updateType, update);
        break;
    }
  };

  #handleModelEvent = (updateType, data) => {
    switch (updateType) {
      case UpdateType.PATCH:
        // Только перерисовать одну карточку (избранное)
        this.#pointPresenters.get(data.id)?.update(data);
        break;
      case UpdateType.MINOR:
        // Перерисовать список (добавление/удаление/редактирование)
        this.#clearBoard();
        this.#renderBoard();
        break;
      case UpdateType.MAJOR:
        // Перерисовать всё и сбросить сортировку (смена фильтра, «New Event»)
        this.#clearBoard({ resetSortType: true });
        this.#renderBoard();
        break;
    }
  };

  #handleModeChange = () => {
    // Закрыть форму создания и все формы редактирования
    this.#newPointPresenter.destroy();
    this.#pointPresenters.forEach((p) => p.resetView());
  };

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) { return; }
    this.#currentSortType = sortType;
    this.#clearBoard();
    this.#renderBoard();
  };
}
