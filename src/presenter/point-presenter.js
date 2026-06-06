import PointView from '../view/point-view.js';
import RedactionFormView from '../view/redaction-form-view.js';
import { render, replace, remove } from '../framework/render.js';
import { UserAction, UpdateType } from '../const.js';

export default class PointPresenter {
  #container = null;
  #point = null;
  #offers = null;
  #destination = null;
  #allOffers = null;
  #allDestinations = null;
  #onDataChange = null;
  #onModeChange = null;
  #isEditMode = false;
  #pointComponent = null;
  #redactionComponent = null;

  constructor({
    container, point, offers, destination,
    allOffers, allDestinations, onDataChange, onModeChange,
  }) {
    this.#container = container;
    this.#point = point;
    this.#offers = offers;
    this.#destination = destination;
    this.#allOffers = allOffers;
    this.#allDestinations = allDestinations;
    this.#onDataChange = onDataChange;
    this.#onModeChange = onModeChange;
  }

  init() {
    this.#pointComponent = new PointView({
      point: this.#point,
      offers: this.#offers,
      destination: this.#destination,
      onOpenRedactionButtonClick: this.#handleOpen,
      onFavoriteClick: this.#handleFavoriteClick,
    });

    this.#redactionComponent = new RedactionFormView({
      point: this.#point,
      allOffers: this.#allOffers,
      allDestinations: this.#allDestinations,
      onCloseRedactionButtonClick: this.#handleClose,
      onSubmitButtonClick: this.#handleSubmit,
      onDeleteButtonClick: this.#handleDelete,
    });

    render(this.#pointComponent, this.#container);
  }

  resetView() {
    if (this.#isEditMode) {
      this.#redactionComponent.reset(this.#point);
      this.#switchToView();
      document.removeEventListener('keydown', this.#escKeyDownHandler);
    }
  }

  update(updatedPoint) {
    this.#point = updatedPoint;
    const newPointComponent = new PointView({
      point: this.#point,
      offers: this.#offers,
      destination: this.#destination,
      onOpenRedactionButtonClick: this.#handleOpen,
      onFavoriteClick: this.#handleFavoriteClick,
    });

    if (!this.#isEditMode) {
      replace(newPointComponent, this.#pointComponent);
    }
    this.#pointComponent = newPointComponent;
  }

  destroy() {
    remove(this.#pointComponent);
    remove(this.#redactionComponent);
    document.removeEventListener('keydown', this.#escKeyDownHandler);
  }

  setSaving() {
    if (this.#isEditMode) {
      this.#redactionComponent.setSaving();
    }
  }

  setDeleting() {
    if (this.#isEditMode) {
      this.#redactionComponent.setDeleting();
    }
  }

  setAborting() {
    if (this.#isEditMode) {
      this.#redactionComponent.setAborting();
      return;
    }

    this.#pointComponent.shake();
  }

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      this.#redactionComponent.reset(this.#point);
      this.#switchToView();
      document.removeEventListener('keydown', this.#escKeyDownHandler);
    }
  };

  #handleOpen = () => {
    this.#onModeChange();
    this.#switchToEdit();
    document.addEventListener('keydown', this.#escKeyDownHandler);
  };

  #handleClose = () => {
    this.#redactionComponent.reset(this.#point);
    this.#switchToView();
    document.removeEventListener('keydown', this.#escKeyDownHandler);
  };

  #handleSubmit = (updatedPoint) => {
    this.#onDataChange(UserAction.UPDATE_POINT, UpdateType.MINOR, updatedPoint);
  };

  #handleDelete = (point) => {
    this.#onDataChange(UserAction.DELETE_POINT, UpdateType.MINOR, point);
  };

  #handleFavoriteClick = () => {
    this.#onDataChange(
      UserAction.UPDATE_POINT,
      UpdateType.PATCH,
      { ...this.#point, isFavorite: !this.#point.isFavorite },
    );
  };

  #switchToEdit() {
    replace(this.#redactionComponent, this.#pointComponent);
    this.#isEditMode = true;
  }

  #switchToView() {
    replace(this.#pointComponent, this.#redactionComponent);
    this.#isEditMode = false;
  }
}
