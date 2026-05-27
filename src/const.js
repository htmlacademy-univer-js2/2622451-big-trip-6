import { isActualPoint, isExpiredPoint, isFuturePoint } from './utils';

const SortType = {
  DAY: 'sort-day',
  TIME: 'sort-time',
  PRICE: 'sort-price',
};

const FilterType = {
  EVERYTHING: 'everything',
  FUTURE: 'future',
  PRESENT: 'present',
  PAST: 'past'
};

const filter = {
  [FilterType.EVERYTHING]: (points) => points,
  [FilterType.FUTURE]: (points) => points.filter((point) => isFuturePoint(point)),
  [FilterType.PRESENT]: (points) => points.filter((point) => isActualPoint(point)),
  [FilterType.PAST]: (points) => points.filter((point) => isExpiredPoint(point))
};

const TYPE = ['Taxi', 'Bus', 'Train', 'Ship', 'Drive', 'Flight', 'Check-in', 'Sightseeing', 'Restaurant'];

const EMPTY_LIST_MESSAGE = 'Click New Event to create your first point';

export const UserAction = {
  UPDATE_POINT: 'UPDATE_POINT',
  ADD_POINT:    'ADD_POINT',
  DELETE_POINT: 'DELETE_POINT',
};

export const UpdateType = {
  PATCH: 'PATCH',
  MINOR: 'MINOR',
  MAJOR: 'MAJOR',
};

export const EMPTY_LIST_MESSAGES = {
  [FilterType.EVERYTHING]: 'Click New Event to create your first point',
  [FilterType.FUTURE]:     'There are no future events now',
  [FilterType.PRESENT]:    'There are no present events now',
  [FilterType.PAST]:       'There are no past events now',
};

export {TYPE, EMPTY_LIST_MESSAGE, filter, FilterType, SortType};
