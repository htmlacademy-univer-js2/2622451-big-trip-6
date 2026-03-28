import dayjs from 'dayjs';
// eslint-disable-next-line no-undef
dayjs.extend(require('dayjs/plugin/duration'));

const DATE_FORMAT = 'MMM D';
const DATE_FORMAT_TIME = 'HH:mm';
const DATE_FORMAT_DIFF = 'DD [D] HH [H] mm [M]';
const DATE_FORMAT_DATE_TIME = 'DD/MM/YY HH:MM';

function getRandomArrayElement(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function humanizeTaskDueDate(dueDate) {
  return dueDate ? dayjs(dueDate).format(DATE_FORMAT) : '';
}

function humanizeTaskDueTime(dueDate) {
  return dueDate ? dayjs(dueDate).format(DATE_FORMAT_TIME) : '';
}

function dateDiff(dateFrom, dateTo) {
  const dateFromJs = dayjs(dateFrom, 'YYYY-MM-DDTHH:mm:ss.639Z');
  const dateToJs = dayjs(dateTo, 'YYYY-MM-DDTHH:mm:ss.639Z');
  const diffMs = dateToJs.diff(dateFromJs);
  const timeDuration = dayjs.duration(diffMs);
  return timeDuration.format(DATE_FORMAT_DIFF);
}

function humanizeTaskDueDateTime(date) {
  const dateJs = dayjs(date, 'YYYY-MM-DDTHH:mm:ss.639Z');
  return dateJs.format(DATE_FORMAT_DATE_TIME);
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const sortByDay = (pointA, pointB) => {
  const dateA = new Date(pointA.dateFrom);
  const dateB = new Date(pointB.dateFrom);
  return dateA - dateB;
};

const sortByTime = (pointA, pointB) => {
  const durationA = new Date(pointA.dateTo) - new Date(pointA.dateFrom);
  const durationB = new Date(pointB.dateTo) - new Date(pointB.dateFrom);
  return durationB - durationA;
};

const sortByPrice = (pointA, pointB) => pointB.basePrice - pointA.basePrice;

const isFuturePoint = (point) => dayjs().isBefore(point.dateFrom, 'minute');

const isExpiredPoint = (point) => dayjs(point.dateTo) && dayjs().isAfter(dayjs(point.dateTo), 'milliseconds');

const isActualPoint = (point) => point.dateTo && (dayjs().isSame(dayjs(point.dateFrom), 'minute') || dayjs().isAfter(dayjs(point.dateFrom), 'minute') && dayjs().isBefore(dayjs(point.dateTo), 'minute'));

export {
  capitalizeFirstLetter,
  getRandomArrayElement,
  humanizeTaskDueDate,
  humanizeTaskDueTime,
  humanizeTaskDueDateTime,
  dateDiff,
  isActualPoint,
  isFuturePoint,
  isExpiredPoint,
  sortByDay,
  sortByPrice,
  sortByTime
};
