import Observable from '../framework/observable.js';
import { adaptPointToClient } from '../adapter.js';
import { UpdateType } from '../const.js';

export default class PointsModel extends Observable {
  #apiService = null;
  #points = [];

  constructor(apiService) {
    super();
    this.#apiService = apiService;
  }

  get points() {
    return this.#points;
  }

  async init() {
    const rawPoints = await this.#apiService.getPoints();
    this.#points = rawPoints.map(adaptPointToClient);
    this._notify(UpdateType.MAJOR);
  }

  async updatePoint(updateType, update) {
    const index = this.#points.findIndex((point) => point.id === update.id);
    if (index === -1) {
      throw new Error('Can\'t update non-existing point');
    }

    const rawResponse = await this.#apiService.updatePoint(update);
    const updatedPoint = adaptPointToClient(rawResponse);

    this.#points = [
      ...this.#points.slice(0, index),
      updatedPoint,
      ...this.#points.slice(index + 1),
    ];
    this._notify(updateType, updatedPoint);
  }

  async addPoint(updateType, update) {
    const rawResponse = await this.#apiService.addPoint(update);
    const newPoint = adaptPointToClient(rawResponse);

    this.#points = [newPoint, ...this.#points];
    this._notify(updateType, newPoint);
  }

  async deletePoint(updateType, update) {
    const index = this.#points.findIndex((point) => point.id === update.id);
    if (index === -1) {
      throw new Error('Can\'t delete non-existing point');
    }

    await this.#apiService.deletePoint(update);

    this.#points = [
      ...this.#points.slice(0, index),
      ...this.#points.slice(index + 1),
    ];
    this._notify(updateType, update);
  }
}
