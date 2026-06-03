import PointsPresenter    from './presenter/points-presenter.js';
import PointsModel        from './model/points-model.js';
import DestinationModel   from './model/destination-model.js';
import OffersModel        from './model/offers-model.js';
import FilterPresenter    from './presenter/filter-presenter.js';
import FilterModel        from './model/filter-model.js';
import BigTripApiService  from './big-trip-api-service.js';
import { adaptPointToClient } from './adapter.js';

// ── DOM-элементы ──────────────────────────────────────────────────────────

const filterContainer = document.querySelector('.trip-controls__filters');
const tripContainer   = document.querySelector('.trip-events');
const newEventButton  = document.querySelector('.trip-main__event-add-btn');

// ── Сервис и модели ───────────────────────────────────────────────────────

const apiService      = new BigTripApiService();
const pointsModel     = new PointsModel(apiService);
const offersModel     = new OffersModel();
const filterModel     = new FilterModel();
const destinationModel = new DestinationModel();

// ── Презентеры ────────────────────────────────────────────────────────────

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

// ── Запуск ────────────────────────────────────────────────────────────────

// Рендерим фильтры и презентер сразу — он покажет «Loading…»
filterPresenter.init();
pointsPresenter.init();

// Блокируем кнопку на время загрузки
newEventButton.disabled = true;

/**
 * Загружаем данные параллельно.
 * Если destinations или offers не загрузились — показываем заглушку
 * и не даём работать с приложением (согласно заданию).
 */
Promise.all([
  apiService.getPoints(),
  apiService.getDestinations(),
  apiService.getOffers(),
])
  .then(([points, destinations, offers]) => {
    // Адаптируем точки из серверного формата во внутренний
    const adaptedPoints = points.map(adaptPointToClient);

    offersModel.init(offers);
    destinationModel.init(destinations);
    pointsModel.init(adaptedPoints);

    // Сообщаем презентеру, что данные готовы
    pointsPresenter.onDataLoaded();

    // Разблокируем кнопку только при успешной загрузке
    newEventButton.disabled = false;
  })
  .catch(() => {
    // При любой ошибке (points, destinations, offers) — показываем заглушку
    pointsPresenter.onDataError();
    // Кнопка остаётся заблокированной — приложение не работает
  });

// ── Кнопка «New Event» ────────────────────────────────────────────────────

newEventButton.addEventListener('click', () => {
  pointsPresenter.createPoint();
  newEventButton.disabled = true;
});
