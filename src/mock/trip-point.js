import {getRandomIntegerNumber, generateTripStartDate, generateTripEndDate} from './utils';
import {generateTripOffer} from './trip-offer';
import {generateTripDestination} from './trip-destination';

const Price = {
  MIN: 10,
  MAX: 200,
};

const generateTripPoint = () => {
  let dateFrom = generateTripStartDate();

  return {
    id: new Date().getMilliseconds() + Math.random(),
    basePrice: getRandomIntegerNumber(Price.MIN, Price.MAX),
    dateFrom,
    dateTo: generateTripEndDate(dateFrom),
  };
};

const generateTrip = () => Object.assign({}, generateTripPoint(), generateTripDestination(), generateTripOffer());

const generateTrips = (count) => {
  return count ? new Array(count)
    .fill(``)
    .map(generateTrip) : null;
};

export {generateTrips};
