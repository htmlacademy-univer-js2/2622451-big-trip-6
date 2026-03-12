import PointsPresenter from './presenter/points-presenter.js';
import PointsModel from './model/points-model.js';
import DestinationModel from './model/destination-model.js';
import OffersModel from './model/offers-model.js';


const filterContainer = document.querySelector('.trip-controls__filters');
const tripContainer = document.querySelector('.trip-events');
const pointsModel = new PointsModel();
const offersModel = new OffersModel();
const destinationModel = new DestinationModel();
const pointsPresenter = new PointsPresenter({
  pointsContainer: tripContainer,
  filterContainer: filterContainer,
  pointsModel,
  destinationModel,
  offersModel
});

pointsPresenter.init();
