/**
 * Адаптер: данные сервера → внутренний формат приложения.
 *
 * Сервер присылает snake_case:
 *   base_price, date_from, date_to, is_favorite
 * Приложение использует camelCase:
 *   basePrice, dateFrom, dateTo, isFavorite
 */
function adaptPointToClient(point) {
  return {
    id:          point['id'],
    basePrice:   point['base_price'],
    dateFrom:    point['date_from'],
    dateTo:      point['date_to'],
    destination: point['destination'],
    isFavorite:  point['is_favorite'],
    offers:      point['offers'],
    type:        point['type'],
  };
}

/**
 * Адаптер: внутренний формат приложения → данные сервера.
 *
 * Перед PUT-запросом нужно вернуть snake_case.
 * Поля offersByType и destinationData — UI-хелперы, серверу не нужны.
 */
function adaptPointToServer(point) {
  return {
    'id':           point.id,
    'base_price':   point.basePrice,
    'date_from':    point.dateFrom,
    'date_to':      point.dateTo,
    'destination':  point.destination,
    'is_favorite':  point.isFavorite,
    'offers':       point.offers,
    'type':         point.type,
  };
}

export { adaptPointToClient, adaptPointToServer };
