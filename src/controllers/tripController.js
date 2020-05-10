import {renderComponent, removeComponent} from '../utils/element';
import {getSortedEvents} from './helpers/getSortedEvents';
import {HIDDEN_CLASS} from '../components/abstract-component';

import DayComponent from '../components/main/main-day';
import NoEventComponent from '../components/main/main-no-events';
import MainSortComponent, {SortType} from '../components/main/main-sort';
import DaysComponent from '../components/main/main-days';

import EventController, {Mode as EventControllerMode, EmptyEvent} from './eventController';

export default class TripController {
  constructor(container, eventsModel, api) {
    this._container = container;
    this._eventsModel = eventsModel;
    this._api = api;
    this._eventsControllers = [];
    this._daysComponents = [];
    this._creatingEvent = null;

    this._noEventComponent = new NoEventComponent();
    this._sortComponent = new MainSortComponent();
    this._daysComponent = new DaysComponent();

    this._onDataChange = this._onDataChange.bind(this);
    this._onViewChange = this._onViewChange.bind(this);
    this._onFilterTypeChange = this._onFilterTypeChange.bind(this);
    this._onsSortTypeChange = this._onsSortTypeChange.bind(this);

    this._eventsModel.setFilterTypeChangeHandler(this._onFilterTypeChange);
    this._sortComponent.setSortTypeSelectHandler(this._onsSortTypeChange);
  }

  hide() {
    this._container.classList.add(HIDDEN_CLASS);
  }

  show() {
    this._container.classList.remove(HIDDEN_CLASS);
  }

  render() {
    const events = this._eventsModel.getAllEvents();
    if (events.length < 1) {
      renderComponent(this._container, this._noEventComponent);
      return;
    }

    renderComponent(this._container, this._sortComponent);
    const newEventControlls = this._renderTrip();
    this._eventsControllers = this._eventsControllers.concat(newEventControlls);
  }

  createEvent() {
    if (this._noEventComponent) {
      removeComponent(this._noEventComponent);
      renderComponent(this._container, this._daysComponent);
    }

    if (this._creatingEvent) {
      this._creatingEvent.destroy();
      this._creatingEvent = null;
    }

    const eventListElement = this._daysComponent.getElement();
    this._creatingEvent = new EventController(eventListElement, this._onDataChange, this._onViewChange);
    this._creatingEvent.render(EmptyEvent, EventControllerMode.ADD);
  }

  _renderTrip() {
    renderComponent(this._container, this._daysComponent);
    const daysContainer = this._daysComponent.getElement();

    let dayFrom;
    let daysCount = 0;
    let tripList;
    let dayTrip;

    const sortedEvents = getSortedEvents(this._eventsModel.getFilteredEvents(), this._sortComponent.getSortType());

    return sortedEvents.map((event) => {
      if (this._sortComponent.getSortType() !== SortType.EVENT) {
        dayTrip = new DayComponent();
      }

      if (dayFrom !== event.dateFrom.getDate()) {
        daysCount++;
        dayFrom = event.dateFrom.getDate();

        if (this._sortComponent.getSortType() === SortType.EVENT) {
          dayTrip = new DayComponent(event, daysCount);
        }
      }

      this._daysComponents.push(dayTrip);
      tripList = dayTrip.getElement().querySelector(`.trip-events__list`);
      renderComponent(daysContainer, dayTrip);

      const eventController = new EventController(tripList, this._onDataChange, this._onViewChange);
      eventController.render(event, EventControllerMode.DEFAULT);

      return eventController;
    });
  }

  _removeDays() {
    this._daysComponents.forEach((dayComponent) => removeComponent(dayComponent));
    removeComponent(this._daysComponent);
    this.daysComponents = [];
  }

  _removeEvents() {
    this._eventsControllers.forEach((eventController) => eventController.destroy());
    this._eventsControllers = [];
  }

  _updateEvents() {
    this._removeEvents();
    this._removeDays();
    this.render();
  }

  _onDataChange(eventController, oldData, newData) {
    if (oldData === EmptyEvent) {
      if (newData === null) {
        this._creatingEvent.destroy();
        this._creatingEvent = null;
        eventController.destroy();
      } else {
        this._eventsModel.addEvent(newData);
        this._creatingEvent.destroy();
        this._creatingEvent = null;
        this._updateEvents();
      }
    } else if (newData === null) {
      this._eventsModel.removeEvent(oldData.id);
      this._updateEvents();
    } else {
      this._api.updateEvent(oldData.id, newData)
        .then((eventModel) => {
          const isSuccess = this._eventsModel.updateEvent(oldData.id, eventModel);

          if (isSuccess) {
            eventController.render(eventModel, EventControllerMode.DEFAULT);
            this._updateEvents();
          }
        });
    }
  }

  _onViewChange() {
    if (this._creatingEvent) {
      this._creatingEvent.setDefaultView();
    }

    this._eventsControllers.forEach((it) => it.setDefaultView());
  }

  _onFilterTypeChange() {
    this._sortComponent.resetSortType();
    removeComponent(this._sortComponent);
    renderComponent(this._container, this._sortComponent);
    this._sortComponent.setSortTypeSelectHandler(this._onsSortTypeChange);
    this._updateEvents();
  }

  _onsSortTypeChange() {
    removeComponent(this._daysComponent);
    removeComponent(this._sortComponent);
    renderComponent(this._container, this._sortComponent);
    this._sortComponent.setSortTypeSelectHandler(this._onsSortTypeChange);
    this._updateEvents();
  }
}
