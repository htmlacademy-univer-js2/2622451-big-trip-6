import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(duration);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
import { FilterType } from './const';

export const filter = {
  [FilterType.EVERYTHING]: (points) => points,

  [FilterType.FUTURE]: (points) =>
    points.filter((p) => dayjs(p.dateFrom).isAfter(dayjs())),

  [FilterType.PRESENT]: (points) =>
    points.filter(
      (p) => dayjs(p.dateFrom).isSameOrBefore(dayjs()) &&
            dayjs(p.dateTo).isSameOrAfter(dayjs()),
    ),

  [FilterType.PAST]: (points) =>
    points.filter((p) => dayjs(p.dateTo).isBefore(dayjs())),
};
