import { render, remove } from '../framework/render';
import CreationFormView from '../view/creation-form-view';
import { UserAction, UpdateType } from '../const';

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
    // Гарантируем одну форму
    if (this.#creationFormComponent !== null) { return; }

    this.#creationFormComponent = new CreationFormView({
      allOffers: this.#allOffers,
      allDestinations: this.#allDestinations,
      onCancelButtonClick: this.#handleCancel,
      onSubmitButtonClick: this.#handleSubmit,
    });

    render(this.#creationFormComponent, this.#pointsContainer, 'afterbegin');
    document.addEventListener('keydown', this.#escKeyDownHandler);
  }

  destroy() {
    if (this.#creationFormComponent === null) { return; }

    remove(this.#creationFormComponent);
    this.#creationFormComponent = null;

    document.removeEventListener('keydown', this.#escKeyDownHandler);
    this.#onDestroy();
  }

  #handleSubmit = (newPoint) => {
    this.#onDataChange(
      UserAction.ADD_POINT,
      UpdateType.MINOR,
      // Временный id — в реальном приложении придёт с сервера
      { ...newPoint, id: String(crypto.randomUUID ? crypto.randomUUID() : Date.now()) },
    );
    this.destroy();
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
