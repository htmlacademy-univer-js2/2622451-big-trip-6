import PointView from '../view/point-view';
import RedactionFormView from '../view/redaction-form-view';
import { render, replace } from '../framework/render';

export default class PointPresenter {
  #container = null;
  #point = null;
  #offers = null;
  #offersByType = null;
  #destination = null;

  #pointComponent = null;
  #redactionComponent = null;

  #onDataChange = null;
  #onModeChange = null;
  #isEditMode = false;

  constructor({ container, point, offers, offersByType, destination, onDataChange, onModeChange }) {
    this.#container = container;
    this.#point = point;
    this.#offers = offers;
    this.#offersByType = offersByType;
    this.#destination = destination;
    this.#onDataChange = onDataChange;
    this.#onModeChange = onModeChange;

    this._escKeyDownHandler = this._escKeyDownHandler.bind(this);
  }

  _escKeyDownHandler(evt) {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      this._replaceRedactionToPoint();
      document.removeEventListener('keydown', this._escKeyDownHandler);
    }
  }

  _handleOpen = () => {
    // Сообщаем главному презентеру, что хотим открыть форму, чтобы он закрыл другие
    this.#onModeChange();
    this._replacePointToRedaction();
    document.addEventListener('keydown', this._escKeyDownHandler);
  };

  _handleClose = () => {
    this._replaceRedactionToPoint();
    document.removeEventListener('keydown', this._escKeyDownHandler);
  };

  _handleSubmit = () => {
    this._replaceRedactionToPoint();
    document.removeEventListener('keydown', this._escKeyDownHandler);
  };

  _handleFavoriteClick = () => {
    // Обновляем данные и передаем их наверх
    this.#onDataChange({
      ...this.#point,
      isFavorite: !this.#point.isFavorite
    });
  };

  _replacePointToRedaction() {
    replace(this.#redactionComponent, this.#pointComponent);
    this.#isEditMode = true;
  }

  _replaceRedactionToPoint() {
    replace(this.#pointComponent, this.#redactionComponent);
    this.#isEditMode = false;
  }

  // Метод для сброса представления в исходное состояние (список)
  resetView() {
    if (this.#isEditMode) {
      this._replaceRedactionToPoint();
      document.removeEventListener('keydown', this._escKeyDownHandler);
    }
  }

  // Метод для обновления данных точки без полной перерисовки списка (частичный датабиндинг)
  update(updatedPoint) {
    this.#point = updatedPoint;
    // Пересоздаем компонент с новыми данными и заменяем старый
    const newPointComponent = new PointView({
      point: this.#point,
      offers: this.#offers,
      destination: this.#destination,
      onOpenRedactionButtonClick: this._handleOpen,
      onFavoriteClick: this._handleFavoriteClick,
    });

    replace(newPointComponent, this.#pointComponent);
    this.#pointComponent = newPointComponent;
  }

  init() {
    this.#pointComponent = new PointView({
      point: this.#point,
      offers: this.#offers,
      destination: this.#destination,
      onOpenRedactionButtonClick: this._handleOpen,
      onFavoriteClick: this._handleFavoriteClick,
    });

    this.#redactionComponent = new RedactionFormView({
      point: this.#point,
      offersByType: this.#offersByType,
      destination: this.#destination,
      onCloseRedactionButtonClick: this._handleClose,
      onSubmitButtonClick: this._handleSubmit,
    });

    render(this.#pointComponent, this.#container);
  }
}

