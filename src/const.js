import { isActualPoint, isExpiredPoint, isFuturePoint } from './utils';

const FiltersPoint = {
  EVERYTHING: 'everything',
  FUTURE: 'future',
  PRESENT: 'present',
  PAST: 'past'
};

const SortType = {
  DAY: 'sort-day',
  TIME: 'sort-time',
  PRICE: 'sort-price',
};

const filter = {
  [FiltersPoint.EVERYTHING]: (points) => points,
  [FiltersPoint.FUTURE]: (points) => points.filter((point) => isFuturePoint(point)),
  [FiltersPoint.PRESENT]: (points) => points.filter((point) => isActualPoint(point)),
  [FiltersPoint.PAST]: (points) => points.filter((point) => isExpiredPoint(point))
};

const TYPE = ['Taxi', 'Bus', 'Train', 'Ship', 'Drive', 'Flight', 'Check-in', 'Sightseeing', 'Restaurant'];

const EMPTY_LIST_MESSAGE = 'Click New Event to create your first point';

export {TYPE, EMPTY_LIST_MESSAGE, FiltersPoint, filter, SortType};
