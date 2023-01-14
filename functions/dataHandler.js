export const checkData = (date, numOfLogs) => {
	let numOfExpectedLogs;
	if (date.toDateString() === new Date().toDateString()) {
		numOfExpectedLogs = (date.getHours() * 60 + date.getMinutes()) / 5;
	} else {
		numOfExpectedLogs = 288;
	}
	let difference = numOfExpectedLogs - numOfLogs;
	console.log('Number of Expected Logs: ' + numOfExpectedLogs);
	console.log('Number of Logs: ' + numOfLogs);
	console.log('Difference: ' + difference.toString());
	return difference;
};
