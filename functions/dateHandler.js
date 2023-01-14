export const getPreviousDay = (date = new Date()) => {
	const previous = new Date(date.getTime());
	previous.setDate(date.getDate() - 1);

	return previous;
};
export const getTmrwDate = (date = new Date()) => {
	const previous = new Date(date.getTime());
	previous.setDate(date.getDate() + 1);
	return previous;
};
