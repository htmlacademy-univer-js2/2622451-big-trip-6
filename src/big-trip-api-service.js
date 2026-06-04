import ApiService from './framework/api-service.js';
import { adaptPointToServer } from './adapter.js';

const END_POINT = 'https://24.objects.htmlacademy.pro/big-trip';
const AUTHORIZATION = 'Basic k29xP2mQr7nVw4sL';

export default class BigTripApiService extends ApiService {
  constructor() {
    super(END_POINT, AUTHORIZATION);
  }

  async getPoints() {
    const response = await this._load({ url: 'points' });
    return ApiService.parseResponse(response);
  }

  async getDestinations() {
    const response = await this._load({ url: 'destinations' });
    return ApiService.parseResponse(response);
  }

  async getOffers() {
    const response = await this._load({ url: 'offers' });
    return ApiService.parseResponse(response);
  }

  async updatePoint(point) {
    const response = await this._load({
      url:     `points/${point.id}`,
      method:  'PUT',
      body:    JSON.stringify(adaptPointToServer(point)),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });
    return ApiService.parseResponse(response);
  }

  async addPoint(point) {
    // POST не принимает id — сервер сгенерирует его сам
    const body = adaptPointToServer(point);
    delete body['id'];

    const response = await this._load({
      url:     'points',
      method:  'POST',
      body:    JSON.stringify(body),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });
    return ApiService.parseResponse(response);
  }

  async deletePoint(point) {
    await this._load({
      url:    `points/${point.id}`,
      method: 'DELETE',
    });
  }
}
