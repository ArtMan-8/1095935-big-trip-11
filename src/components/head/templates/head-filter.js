const filterMarkup = (filter, isChecked) => {
  const {name, count} = filter;

  return (
    `<div class="trip-filters__filter">
        <input id="filter-${name}" class="trip-filters__filter-input  visually-hidden" type="radio" name="trip-filter" value="${name}" ${isChecked ? `checked` : ``} ${!count ? `disabled` : ``}>
        <label class="trip-filters__filter-label" for="filter-${name}">${name}</label>
      </div>`
  );
};

export const createHeadFilterTemplate = (filters) => {
  const filtersMarkup = filters
    .map((filter) => filterMarkup(filter, filter.checked))
    .join(`\n`);

  return (
    `<form class="trip-filters" action="#" method="get">
      ${filtersMarkup}
      <button class="visually-hidden" type="submit">Accept filter</button>
    </form>`
  );
};
