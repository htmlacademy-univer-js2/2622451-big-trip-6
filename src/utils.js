import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

const DateFormat = {
  MONTH_DAY: 'MMM D',
  TIME: 'HH:mm',
  DATE_TIME: 'DD/MM/YY HH:mm',
};

const PAD_LENGTH = 2;
const PAD_CHAR = '0';

const pad = (value) => String(value).padStart(PAD_LENGTH, PAD_CHAR);

function humanizeTaskDueDate(dueDate) {
  return dueDate ? dayjs(dueDate).format(DateFormat.MONTH_DAY) : '';
}

function humanizeTaskDueTime(dueDate) {
  return dueDate ? dayjs(dueDate).format(DateFormat.TIME) : '';
}

function dateDiff(dateFrom, dateTo) {
  const diffMs = dayjs(dateTo).diff(dayjs(dateFrom));
  const diff = dayjs.duration(diffMs);
  const days = Math.floor(diff.asDays());
  const hours = diff.hours();
  const minutes = diff.minutes();
  return `${pad(days)}d ${pad(hours)}h ${pad(minutes)}m`;
}

const sortByDay = (pointA, pointB) =>
  new Date(pointA.dateFrom) - new Date(pointB.dateFrom);

const sortByTime = (pointA, pointB) => {
  const durationA = new Date(pointA.dateTo) - new Date(pointA.dateFrom);
  const durationB = new Date(pointB.dateTo) - new Date(pointB.dateFrom);
  return durationB - durationA;
};

const sortByPrice = (pointA, pointB) => pointB.basePrice - pointA.basePrice;

const isFuturePoint = (point) => dayjs().isBefore(point.dateFrom, 'minute');

const isExpiredPoint = (point) =>
  dayjs().isAfter(dayjs(point.dateTo), 'milliseconds');

const isActualPoint = (point) =>
  dayjs().isSameOrAfter(dayjs(point.dateFrom), 'minute') &&
  dayjs().isBefore(dayjs(point.dateTo), 'minute');

export {
  humanizeTaskDueDate,
  humanizeTaskDueTime,
  dateDiff,
  isActualPoint,
  isFuturePoint,
  isExpiredPoint,
  sortByDay,
  sortByPrice,
  sortByTime,
};
