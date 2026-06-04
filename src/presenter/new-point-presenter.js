import { render, remove } from '../framework/render.js';
import CreationFormView from '../view/creation-form-view.js';
import { UserAction, UpdateType } from '../const.js';

export default class NewPointPresenter {
  #pointsContainer = null;
  #creationFormComponent = null;
  #allOffers = null;
  #allDestinations = null;
  #onDataChange = null;
  #onDestroy = null;

  constructor({ pointsContainer, allOffers, allDestinations, onDataChange, onDestroy }) {
    this.#pointsContainer = pointsContainer;
    this.#allOffers = allOffers;
    this.#allDestinations = allDestinations;
    this.#onDataChange = onDataChange;
    this.#onDestroy = onDestroy;
  }

  init() {
    if (this.#creationFormComponent !== null) {
      return;
    }

    this.#creationFormComponent = new CreationFormView({
      allOffers:           this.#allOffers,
      allDestinations:     this.#allDestinations,
      onCancelButtonClick: this.#handleCancel,
      onSubmitButtonClick: this.#handleSubmit,
    });

    render(this.#creationFormComponent, this.#pointsContainer, 'afterbegin');
    document.addEventListener('keydown', this.#escKeyDownHandler);
  }

  destroy() {
    if (this.#creationFormComponent === null) {
      return;
    }

    remove(this.#creationFormComponent);
    this.#creationFormComponent = null;
    document.removeEventListener('keydown', this.#escKeyDownHandler);
    this.#onDestroy();
  }

  setSaving() {
    this.#creationFormComponent?.setSaving();
  }

  setAborting() {
    this.#creationFormComponent?.setAborting();
  }

  #handleSubmit = (newPoint) => {
    const { id: _discarded, ...pointWithoutId } = newPoint;

    this.#onDataChange(
      UserAction.ADD_POINT,
      UpdateType.MINOR,
      pointWithoutId,
    );
  };

  #handleCancel = () => {
    this.destroy();
  };

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      this.destroy();
    }
  };
}
