export const loadParams = (route) => {
	let user, devices, device, deviceName;
	user = route.params['user'];
	devices = route.params['devices'];
	deviceName = route.params['device'];
	device = devices[deviceName];
	if (!(user || devices || deviceName || device)) {
		throw new Error('Error');
	}
	return [user, devices, device, deviceName];
};
