
export const filterDomesticTours = (allTours) =>
    allTours.filter((tour) => tour.tourType?.toLowerCase() === "domestic");

export const filterInternationalTours = (allTours) =>
    allTours.filter((tour) => tour.tourType?.toLowerCase() === "international");

export const filterDiscountTours = (allTours) =>
    allTours.filter((tour) => tour.discount > 0);
