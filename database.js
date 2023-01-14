import firestore from '@react-native-firebase/firestore';

export const getUsers = async () => {
	let to_return = [];
	let users = await firestore().collection('users').get();
	users.forEach(user => {
		to_return.push({
			key: user.id, value: user.data(),
		});
	});
	// console.log(to_return);
};
//
export const getUser = async (username) => {
	let user = await (await firestore().collection('users')
		.doc(username).get()).data();
	// console.log(user);
	return user;
};

export const getDevices = async (username) => {
	let to_return = {};
	const devices = await firestore().collection('users')
		.doc(username)
		.collection('devices')
		.get();
	devices.forEach(device => {
		to_return[device.id] = device.data();
	});
	// console.log(to_return);
	return to_return;
};

export const getDevice = async (username, deviceName) => {
	const device = await (await firestore().collection('users')
		.doc(username)
		.collection('devices')
		.doc(deviceName)
		.get())
		.data();
	// console.log(device);
	return device;
};

export const addUser = async (data, pwd, tkn, scrt, expire) => {
	let username = data['username'].trim();
	let password = pwd.trim();
	let plant_id = data['plantid'].trim();
	let token = tkn.trim();
	let secret = scrt.trim();
	let sn = data['sn'].trim();
	let pn = data['pn'].trim();
	let devcode = data['devcode'].trim();
	let deviceName = data['devicename'].trim();

	let user = {
		'username': username, 'password': password, 'plant_id': plant_id, 'secret': secret, 'token': token, 'expire': expire,
	};
	let device = {
		'devcode': devcode, 'pn': pn, 'sn': sn,
	};
	if (!await getUser(username)) {
		await firestore().collection('users')
			.doc(username)
			.set(user);
		await firestore().collection('users')
			.doc(username)
			.collection('devices')
			.doc(deviceName)
			.set(device);
		console.log('Success');
		return {'Success': true};
	} else {
		console.log('User already exits!');
		return {'Error': 'User already exits!'};
	}
};

export const addDevice = async (usrname, data) => {
	let username = usrname.trim();
	let sn = data['sn'].trim();
	let pn = data['pn'].trim();
	let devcode = data['devcode'].trim();
	let deviceName = data['devicename'].trim();

	const device = {
		'devcode': devcode, 'pn': pn, 'sn': sn,
	};

	if (!await getDevice(username, deviceName)) {
		await firestore().collection('users')
			.doc(username)
			.collection('devices')
			.doc(deviceName)
			.set(device);
		console.log('Success');
		return {'Success': true};
	} else {
		return {'Error': 'User already exits!'};
	}
};
export const updateToken = async (usrname, tkn, scrt, expire) => {
	let username = usrname.trim();
	let token = tkn.trim();
	let secret = scrt.trim();
	if (await getUser(username)) {
		await firestore().collection('users')
			.doc(username).update({
				'token': token, 'secret': secret, 'expire': expire,
			});
		console.log('Success');
		return {'Success': true};
	} else {
		return {'Error': 'User doesn\'t exist!'};
	}
};
export const addLogsByDay = async (username, deviceName, day, logs) => {
	const data = await retrieveLogsByDay(username, deviceName, day);
	const keys = Object.keys(data);
	let i = 0;
	for (const [key, value] of Object.entries(logs)) {
		if (!keys.includes(key)) {
			i += 1;
			await firestore().collection('users')
				.doc(username)
				.collection('devices')
				.doc(deviceName)
				.collection('logs')
				.doc(day)
				.collection('timestamps')
				.doc(key)
				.set(value, {merge: true});
		}
	}
	console.log(i + ' Logs Added');
	return {'Success': true};
};
export const retrieveLogsByDay = async (username, deviceName, day) => {
	let logs = {};
	return firestore().collection('users')
		.doc(username)
		.collection('devices')
		.doc(deviceName)
		.collection('logs')
		.doc(day)
		.collection('timestamps')
		.orderBy('Timestamp', 'desc')
		.get().then(collection => {
			collection.docs.map(doc => {
				logs[doc.id] = doc.data();
			});
			// console.log(logs);
			return logs;
		});
};
export const retrieveLatestLog = async (username, deviceName, day) => {
	let logs = {};
	return firestore().collection('users')
		.doc(username)
		.collection('devices')
		.doc(deviceName)
		.collection('logs')
		.doc(day)
		.collection('timestamps')
		.orderBy('Timestamp', 'desc')
		.limit(1)
		.get().then(collection => {
			const log = collection.docs[0];
			return log.data();
		});
};
export const retrieveGridTime = async (username, deviceName, day) => {
	return firestore().collection('users')
		.doc(username)
		.collection('devices')
		.doc(deviceName)
		.collection('logs')
		.doc(day)
		.collection('timestamps')
		.where('Grid Voltage', '>', '200')
		.count()
		.get()
		.then(data => {
			const count = data.data().count;
			return (Math.floor(count * 5 / 60).toString() + ':' + (count * 5 % 60).toString() + ' hours');
		});
};
export const retrievePVTime = async (username, deviceName, day) => {
	return firestore().collection('users')
		.doc(username)
		.collection('devices')
		.doc(deviceName)
		.collection('logs')
		.doc(day)
		.collection('timestamps')
		.where('PV1 Input Voltage', '>', '200')
		.count()
		.get()
		.then(data => {
			const count = data.data().count;
			return (Math.floor(count * 5 / 60).toString() + ':' + (count * 5 % 60).toString() + ' hours');
		});
};
export const retrieveLastUpdate = async (username, deviceName, day) => {
	const lastUpdate = (await firestore().collection('users')
		.doc(username)
		.collection('devices')
		.doc(deviceName)
		.collection('logs')
		.doc(day)
		.get())
		.data(['lastUpdated']);
	if (lastUpdate) {
		return lastUpdate.lastUpdated.toDate();
	} else {
		return null;
	}
};
export const updateLastUpdate = async (username, deviceName, day, date) => {
	await firestore().collection('users')
		.doc(username)
		.collection('devices')
		.doc(deviceName)
		.collection('logs')
		.doc(day).set({
			'lastUpdated': firestore.Timestamp.fromDate(date),
		}, {merge: true});
	console.log('Last Update Updated');
	return {'Success': true};
};

export const retrieveNumOfLogs = async (username, deviceName, day) => {
	return firestore().collection('users')
		.doc(username)
		.collection('devices')
		.doc(deviceName)
		.collection('logs')
		.doc(day)
		.collection('timestamps')
		.count()
		.get()
		.then(data => {
			return data.data().count;
		});
};
