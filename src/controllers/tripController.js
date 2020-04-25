import {SortType} from '../utils/const';
import {getEventTime} from '../utils/common';
import {renderComponent} from '../utils/element';

import MainEventNo from '../components/page-main/event-no';
import MainEventsSort from '../components/page-main/trip-sort';
import MainTripDay from '../components/page-main/trip-day/trip-days__item';
import MainTripDays from '../components/page-main/trip-days';

import EventController from './eventController';

const renderTrip = (trip, container, isSorting = SortType.EVENT) => {
  let dayFrom;
  let daysCount = 0;
  let tripDay;
  let dayTrip;

  if (isSorting !== SortType.EVENT) {
    dayTrip = new MainTripDay();
    tripDay = dayTrip.getElement().querySelector(`.trip-events__list`);
  }

  for (const event of trip) {
    if (dayFrom !== event.dateFrom.getDate()) {
      dayFrom = event.dateFrom.getDate();
      daysCount++;
      dayFrom = event.dateFrom.getDate();

      if (isSorting === SortType.EVENT) {
        dayTrip = new MainTripDay(daysCount, event.dateFrom);
        tripDay = dayTrip.getElement().querySelector(`.trip-events__list`);
      }

      renderComponent(container, dayTrip);
    }

    let eventController = new EventController(tripDay);
    eventController.render(event);
  }
};

const getSortedEvents = (events, sortType = SortType.EVENT) => {
  const trip = events.slice();
  let sortedEvents = [];

  switch (sortType) {
    case SortType.EVENT:
      sortedEvents = trip.sort((a, b) => Date.parse(a.dateFrom) - Date.parse(b.dateFrom));
      break;
    case SortType.TIME:
      sortedEvents = trip.sort((a, b) => getEventTime(b.dateFrom, b.dateTo) - getEventTime(a.dateFrom, a.dateTo));
      break;
    case SortType.PRICE:
      sortedEvents = trip.sort((a, b) => b.basePrice - a.basePrice);
      break;
  }

  return sortedEvents;
};

export default class TripController {
  constructor(container) {
    this._noEvents = new MainEventNo();
    this._mainEventSort = new MainEventsSort();
    this._tripDays = new MainTripDays();
    this._eventsSorted = null;
    this._container = container;
  }

  render(trip) {
    if (!trip) {
      renderComponent(this._container, this._noEvents);
    } else {
      this._eventsSorted = getSortedEvents(trip);
      renderComponent(this._container, this._mainEventSort);
      renderComponent(this._container, this._tripDays);

      const daysContainer = this._tripDays.getElement();
      renderTrip(this._eventsSorted, daysContainer);

      this._mainEventSort.setSortTypeSelectHandler((sortType) => {
        this._eventsSorted = getSortedEvents(this._eventsSorted, sortType);
        daysContainer.innerHTML = ``;
        renderTrip(this._eventsSorted, daysContainer, sortType);
      });
    }
  }
}
