import PointView from '../view/point-view';
import RedactionFormView from '../view/redaction-form-view';
import { render, replace, remove } from '../framework/render';


export default class PointPresenter {
  #container = null;
  #point = null;
  #offers = null;
  #destination = null;
  #allOffers = null;
  #allDestinations = null;

  #pointComponent = null;
  #redactionComponent = null;

  #onDataChange = null;
  #onModeChange = null;
  #isEditMode = false;

  constructor({
    container,
    point,
    offers,
    destination,
    allOffers,
    allDestinations,
    onDataChange,
    onModeChange,
  }) {
    this.#container = container;
    this.#point = point;
    this.#offers = offers;
    this.#destination = destination;
    this.#allOffers = allOffers;
    this.#allDestinations = allDestinations;
    this.#onDataChange = onDataChange;
    this.#onModeChange = onModeChange;

    this._escKeyDownHandler = this._escKeyDownHandler.bind(this);
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
      allOffers: this.#allOffers,
      allDestinations: this.#allDestinations,
      onCloseRedactionButtonClick: this._handleClose,
      onSubmitButtonClick: this._handleSubmit,
    });

    render(this.#pointComponent, this.#container);
  }

  resetView() {
    if (this.#isEditMode) {
      this.#redactionComponent.reset(this.#point);
      this._replaceRedactionToPoint();
      document.removeEventListener('keydown', this._escKeyDownHandler);
    }
  }

  update(updatedPoint) {
    this.#point = updatedPoint;

    const newPointComponent = new PointView({
      point: this.#point,
      offers: this.#offers,
      destination: this.#destination,
      onOpenRedactionButtonClick: this._handleOpen,
      onFavoriteClick: this._handleFavoriteClick,
    });

    if (!this.#isEditMode) {
      replace(newPointComponent, this.#pointComponent);
    }
    this.#pointComponent = newPointComponent;
  }

  destroy() {
    remove(this.#pointComponent);
    remove(this.#redactionComponent);
    document.removeEventListener('keydown', this._escKeyDownHandler);
  }

  _escKeyDownHandler(evt) {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      this.#redactionComponent.reset(this.#point);
      this._replaceRedactionToPoint();
      document.removeEventListener('keydown', this._escKeyDownHandler);
    }
  }

  _handleOpen = () => {
    this.#onModeChange();
    this._replacePointToRedaction();
    document.addEventListener('keydown', this._escKeyDownHandler);
  };

  _handleClose = () => {
    this.#redactionComponent.reset(this.#point);
    this._replaceRedactionToPoint();
    document.removeEventListener('keydown', this._escKeyDownHandler);
  };

  _handleSubmit = (updatedPoint) => {
    this.#onDataChange(updatedPoint);
    this._replaceRedactionToPoint();
    document.removeEventListener('keydown', this._escKeyDownHandler);
  };

  _handleFavoriteClick = () => {
    this.#onDataChange({
      ...this.#point,
      isFavorite: !this.#point.isFavorite,
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
}
