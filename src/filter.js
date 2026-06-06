import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { FilterType } from './const.js';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const filter = {
  [FilterType.EVERYTHING]: (points) => points,

  [FilterType.FUTURE]: (points) =>
    points.filter((point) => dayjs(point.dateFrom).isAfter(dayjs())),

  [FilterType.PRESENT]: (points) =>
    points.filter(
      (point) =>
        dayjs(point.dateFrom).isSameOrBefore(dayjs()) &&
        dayjs(point.dateTo).isSameOrAfter(dayjs()),
    ),

  [FilterType.PAST]: (points) =>
    points.filter((point) => dayjs(point.dateTo).isBefore(dayjs())),
};

export { filter };
