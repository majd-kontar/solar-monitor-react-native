import {updateToken} from './database';
import strftime from 'strftime';
import sha1 from 'crypto-js/sha1';
import axios from 'axios';
import {values} from '@babel/runtime/helpers/regeneratorRuntime';


const debug = 1;
const timezone = 'Asia/Beirut';
const base_url = 'http://api.shinemonitor.com/public/';
const headers = {
	'User-Agent': 'Mozilla/5.0 (X11; CrOS x86_64 12871.102.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.141 Safari/537.36',
};
const app = '&source=1&_app_client_=android&_app_id_=wifiapp.volfw.watchpower&_app_version_=1.0.6.3';

const salt = () => {
	return (Math.round(Date.now())).toString();
};
const checkToken = async (user) => {
	const d = new Date();
	const e = new Date();
	e.setSeconds(e.getSeconds() + user['expire']);
	try {
		if (debug === 1) {
			console.log('Datetime now:  ' + d.toString());
			console.log('Expires:       ' + e.toString());
		}
		if (d > e) {
			if (debug === 1) {
				console.log('Expired');
			}
			throw new Error('Token Expired!');
		} else {
			if (debug === 1) {
				console.log('Not expired');
			}
		}
	} catch (e) {
		if (debug === 1) {
			console.log('Logging in using credentials');
			const [err, token, secret, expire] = await login(user['username'], user['password']);
			await updateToken(user['username'], token, secret, expire);
		}
	}
};
const buildRequestUrl = async (action, salt = undefined, secret = undefined, token = undefined,
                               device_code = undefined, plant_id = undefined, pn = undefined,
                               sn = undefined, usr = undefined, pwd = undefined,
                               field = undefined, page = 0, day = undefined) => {
	let req_action;
	let req_sign;
	let sign;
	let req_url;
	const date = new Date();
	if (!day) {
		day = strftime('%Y-%m-%d', date);
	}
	if (action === 'queryPlantCurrentData') {
		action = '&action=queryPlantCurrentData&plantid=' + plant_id + '&par=ENERGY_TOTAL,ENERGY_PROCEEDS,ENERGY_CO2';
	} else if (action === 'queryPlantActiveOutputPowerOneDay') {
		action = '&action=queryPlantActiveOuputPowerOneDay&plantid=' + plant_id + '&date=' + day + '&i18n=en_US&lang=en_US' + app;
	} else if (action === 'queryDeviceDataOneDayPaging') {
		action = '&action=queryDeviceDataOneDayPaging&devaddr=1&pn=' + pn + '&devcode=' + device_code + '&sn=' + sn + '&date=' + day + '&page=' +
			page.toString() + '&pagesize=500&i18n=en_US&lang=en_US' + app;
	} else if (action === 'queryPlantDeviceDesignatedInformation') {
		action = '&action=queryPlantDeviceDesignatedInformation&plantid=' + plant_id + '&devtype=512&parameter=energy_today,energy_total&i18n=en_US&lang=en_US' + app;
	} else if (action === 'queryDeviceChartFieldDetailData') {
		action = '&action=queryDeviceChartFieldDetailData&pn=' + pn + '&devcode=' + device_code + '&sn=' + sn + '&field=' + field + '&devaddr=' + '1' + '&precision=' + '5' + '&sdate=' +
			date.replace(hour = 0, minute = 0, second = 0, microsecond = 0).toString().encode('utf-8').toString() + '&edate=' +
			date.replace(hour = 23, minute = 59, second = 59, microsecond = 0).toString().encode('utf-8').toString() + '&i18n=en_US&lang=en_US' + app;
	} else if (action === 'login') {
		action = '&action=authSource&usr=' + usr.replace('+', '%2B') + '&company-key=bnrl_frRFjEz8Mkn' + '&i18n=en_US&lang=en_US' + app;
		// Hashed passowrd
		// sha1(encodeURI(pwd)).toString()
		req_action = salt.toString() + pwd + action;
		req_sign = sha1(encodeURI(req_action));
		sign = req_sign.toString();
		req_url = base_url + '?sign=' + sign + '&salt=' + salt.toString() + action;
		return req_url;
	}
	req_action = salt.toString() + secret + token + action;
	req_sign = sha1(encodeURI(req_action));
	sign = req_sign.toString();
	req_url = base_url + '?sign=' + sign + '&salt=' + salt.toString() + '&token=' + token + action;
	console.log(req_url);
	return req_url;
};


export const login = async (usr, pwd) => {
	return buildRequestUrl('login', salt(), undefined, undefined, undefined, undefined, undefined, undefined, usr, pwd).then(req_url => {
		return axios.get(req_url,
			{
				headers: headers,
			},
		).then(response => {
			console.log(response);
			let data = response['data'];
			if (data['err'] === 0) {
				const token = data.dat['token'];
				const secret = data.dat['secret'];
				let expire = data.dat['expire'];
				const d = new Date();
				expire = d.setSeconds(d.getSeconds() + expire);
				return [0, token, secret, expire];
			} else {
				throw data['desc'];
			}
		}).catch(error => {
			console.log(error);
			return [error, undefined, undefined, undefined];
		});
	});
};
export const getLogsToday = async (user, device) => {
	await checkToken(user);
	return buildRequestUrl('queryDeviceDataOneDayPaging', salt(), user['secret'], user['token'], device['devcode'], user['plant_id'], device['pn'], device['sn']).then(req_url => {
		return axios.get(req_url,
			{
				headers: headers,
			},
		).then(response => {
			let data = response['data'];
			let errcode = data['err'];
			if (errcode === 0) {
				let timeLog = {};
				data = data.dat;
				for (let i = 0; i < data.pagesize; i++) {
					let log = {};
					for (let j = 0; j < data.title.length; j++) {
						log[data.title[j].title] = data.row[i].field[j];
					}
					timeLog[data['row'][i]['field'][1]] = log;
				}
				return timeLog;
			} else {
				throw errcode.toString();
			}
		}).catch(error => {
			console.log('error');
			// console.log(error['desc'])
			return {'Error code': error};

		});
	});
};

export const getAllLogsPerDay = async (user, device, day) => {
	let timeLog = {};
	await checkToken(user);
	for (let page = 0; page < 6; page++) {
		await buildRequestUrl('queryDeviceDataOneDayPaging', salt(), user['secret'], user['token'],
			device['devcode'], user['plant_id'], device['pn'], device['sn'], undefined, undefined,
			undefined, page, day).then(async req_url => {
				await axios.get(req_url, {
					headers: headers,
				}).then(response => {
						let data = response['data'];
						let errcode = data['err'];
						if (errcode === 0) {
							data = data.dat;
							for (let i = 0; i < data.pagesize; i++) {
								let log = {};
								for (let j = 0; j < data.title.length; j++) {
									log[data.title[j].title] = data.row[i]['field'][j];
								}
								timeLog[data['row'][i]['field'][1]] = log;
							}

						} else if (errcode === 12) {
							return timeLog;
						} else {
							throw errcode.toString();
						}
					},
				).catch(error => {
					return {'Error code': error};
				});

			},
		);
	}
	return timeLog;
};

export const getLogsByDay = async (user, device, day) => {
	await checkToken(user);
	return buildRequestUrl('queryDeviceDataOneDayPaging', salt(), user['secret'], user['token'],
		device['devcode'], user['plant_id'], device['pn'], device['sn'], undefined, undefined,
		undefined, undefined, day).then(req_url => {
		return axios.get(req_url,
			{
				headers: headers,
			},
		).then(response => {
			let data = response['data'];
			let errcode = data['err'];
			if (errcode === 0) {
				let timeLog = {};
				data = data.dat;
				for (let i = 0; i < data.pagesize; i++) {
					let log = {};
					for (let j = 0; j < data.title.length; j++) {
						log[data.title[j].title] = data.row[i].field[j];
					}
					timeLog[data['row'][i]['field'][1]] = log;
				}
				return timeLog;
			} else {
				throw errcode.toString();
			}
		}).catch(error => {
			console.log('error');
			// console.log(error['desc'])
			return {'Error code': error};

		});
	});
};


export const getEnergySummary = async (user) => {
	await checkToken(user);
	return buildRequestUrl('queryPlantCurrentData', salt(), user['secret'], user['token'], undefined, user['plant_id']).then(req_url => {
		return axios.get(req_url,
			{
				headers: headers,
			},
		).then(response => {
			let data = response['data'];
			let errcode = data['err'];
			if (errcode === 0) {
				data = data.dat;
				console.log(data);
				return data;
			} else {
				throw errcode.toString();
			}
		}).catch(error => {
			console.log('error');
			// console.log(error['desc'])
			return {'Error code': error};

		});
	});
};
