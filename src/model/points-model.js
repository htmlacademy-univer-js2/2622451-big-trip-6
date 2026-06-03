import Observable from '../framework/observable.js';
import { adaptPointToClient } from '../adapter.js';

export default class PointsModel extends Observable {
  #apiService = null;
  #points = [];

  constructor(apiService) {
    super();
    this.#apiService = apiService;
  }

  /** Вызывается из main.js после Promise.all */
  init(points) {
    this.#points = points;
  }

  get points() {
    return this.#points;
  }

  /**
   * Обновить точку: PUT на сервер → адаптировать ответ → обновить массив.
   * Сервер отвечает в snake_case — adaptPointToClient переводит в camelCase.
   */
  async updatePoint(updateType, update) {
    const index = this.#points.findIndex((p) => p.id === update.id);
    if (index === -1) {
      throw new Error("Can't update non-existing point");
    }

    const rawResponse  = await this.#apiService.updatePoint(update);
    const updatedPoint = adaptPointToClient(rawResponse);   // <-- фикс баг 2

    this.#points = [
      ...this.#points.slice(0, index),
      updatedPoint,
      ...this.#points.slice(index + 1),
    ];

    this._notify(updateType, updatedPoint);
  }

  addPoint(updateType, update) {
    this.#points = [update, ...this.#points];
    this._notify(updateType, update);
  }

  deletePoint(updateType, update) {
    const index = this.#points.findIndex((p) => p.id === update.id);
    if (index === -1) {
      throw new Error("Can't delete non-existing point");
    }
    this.#points = [
      ...this.#points.slice(0, index),
      ...this.#points.slice(index + 1),
    ];
    this._notify(updateType, update);
  }
}
