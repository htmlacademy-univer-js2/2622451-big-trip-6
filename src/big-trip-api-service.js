import ApiService from './framework/api-service.js';
import { adaptPointToServer } from './adapter.js';

const END_POINT = 'https://24.objects.htmlacademy.pro/big-trip';
const AUTHORIZATION = 'Basic k29xP2mQr7nVw4sL';

export default class BigTripApiService extends ApiService {
  constructor() {
    super(END_POINT, AUTHORIZATION);
  }

  /** Получить все точки маршрута */
  async getPoints() {
    const response = await this._load({ url: 'points' });
    return ApiService.parseResponse(response);
  }

  /** Получить все пункты назначения */
  async getDestinations() {
    const response = await this._load({ url: 'destinations' });
    return ApiService.parseResponse(response);
  }

  /** Получить все дополнительные опции */
  async getOffers() {
    const response = await this._load({ url: 'offers' });
    return ApiService.parseResponse(response);
  }

  /**
   * Обновить точку маршрута на сервере
   * @param {Object} point — точка во внутреннем формате приложения
   * @returns {Promise<Object>} — обновлённая точка в формате сервера
   */
  async updatePoint(point) {
    const response = await this._load({
      url: `points/${point.id}`,
      method: 'PUT',
      body: JSON.stringify(adaptPointToServer(point)),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });
    return ApiService.parseResponse(response);
  }
}
