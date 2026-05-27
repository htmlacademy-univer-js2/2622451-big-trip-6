import PointsPresenter from './presenter/points-presenter.js';
import PointsModel from './model/points-model.js';
import DestinationModel from './model/destination-model.js';
import OffersModel from './model/offers-model.js';
import FilterPresenter from './presenter/filter-presenter';
import FilterModel from './model/filter-model';

const filterContainer = document.querySelector('.trip-controls__filters');
const tripContainer = document.querySelector('.trip-events');
const newEventButton = document.querySelector('.trip-main__event-add-btn');
const pointsModel = new PointsModel();
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

newEventButton.addEventListener('click', () => {
  pointsPresenter.createPoint();
  newEventButton.disabled = true;
});
