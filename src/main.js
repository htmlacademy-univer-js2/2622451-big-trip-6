import PointsPresenter from './presenter/points-presenter.js';
import PointsModel from './model/points-model.js';
import DestinationModel from './model/destination-model.js';
import OffersModel from './model/offers-model.js';
import FilterPresenter from './presenter/filter-presenter.js';
import FilterModel from './model/filter-model.js';
import BigTripApiService from './big-trip-api-service.js';
import { adaptPointToClient } from './adapter.js';

const filterContainer = document.querySelector('.trip-controls__filters');
const tripContainer = document.querySelector('.trip-events');
const newEventButton = document.querySelector('.trip-main__event-add-btn');

const apiService = new BigTripApiService();
const pointsModel = new PointsModel(apiService);
const offersModel = new OffersModel();
const filterModel = new FilterModel();
const destinationModel = new DestinationModel();

const pointsPresenter = new PointsPresenter({
  pointsContainer: tripContainer,
  pointsModel,
  filterModel,
  destinationModel,
  offersModel,
  onNewPointDestroy: () => {
    newEventButton.disabled = false;
  },
});

const filterPresenter = new FilterPresenter({
  filterContainer: filterContainer,
  filterModel,
  pointsModel,
});

filterPresenter.init();
pointsPresenter.init();

newEventButton.disabled = true;

Promise.all([
  apiService.getPoints(),
  apiService.getDestinations(),
  apiService.getOffers(),
])
  .then(([points, destinations, offers]) => {
    const adaptedPoints = points.map(adaptPointToClient);

    offersModel.init(offers);
    destinationModel.init(destinations);
    pointsModel.init(adaptedPoints);

    pointsPresenter.onDataLoaded();

    newEventButton.disabled = false;
  })
  .catch(() => {
    pointsPresenter.onDataError();
  });

newEventButton.addEventListener('click', () => {
  pointsPresenter.createPoint();
  newEventButton.disabled = true;
});
