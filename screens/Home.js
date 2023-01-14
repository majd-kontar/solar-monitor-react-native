import {Easing, ScrollView, StyleSheet, Text, View} from 'react-native';
import Navbar from '../components/Navbar';
import {getLogsToday} from '../shine_monitor_api';
import React, {useEffect, useState} from 'react';
import {Row, Table} from 'react-native-table-component';
import {loadParams} from '../functions/naviagationParamsHandler';
import Devices from '../components/Devices';
import Status from '../components/Status';
import Loading from '../components/Loading';
import {textStyles} from '../styles/textStyles';
import {addLogsByDay, retrieveLastUpdate, retrieveLatestLog, retrieveLogsByDay, updateLastUpdate} from '../database';
import strftime from 'strftime';
import Error from '../components/Error';

const borderColor = '#000000';
const primaryColor = 'dodgerblue';
const backgroundColor = '#eee';

const Home = ({route, navigation}) => {
	let user, devices, dev, devName;
	try {
		[user, devices, dev, devName] = loadParams(route);
	} catch (e) {
		navigation.navigate('Login');
	}
	const [device, setDevice] = useState(dev);
	const [deviceName, setDeviceName] = useState(devName);
	const [isError, setIsError] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [log, setLog] = useState();
	const titles = ['AC Output Active Power', 'Output Load Percent', 'Battery Capacity', 'Battery Voltage', 'Battery Charging Current',
		'Battery Discharge Current', 'PV1 Charging Power', 'PV1 Input Voltage', 'PV1 Input Current', 'AC Output Voltage', 'Grid Voltage'];


	const getLogs = () => {
		const date = new Date();
		retrieveLastUpdate(user.username, deviceName, strftime('%Y-%m-%d', date)).then(async lastUpdate => {
			const difference = lastUpdate ? (date - lastUpdate) / 60000 : 10;
			if (difference > 5) {
				await getLogsToday(user, device).then(response => {
					updateLastUpdate(user.username, deviceName, strftime('%Y-%m-%d', date), date);
					addLogsByDay(user.username, deviceName, strftime('%Y-%m-%d', date), response);
					setLog(response[Object.keys(response).sort(() => 1)[0]]);
				});
			} else {
				await retrieveLatestLog(user.username, deviceName, strftime('%Y-%m-%d', date)).then(data => setLog(data));
			}
			setIsLoading(false);
		}).catch(() => setIsError(true));
	};

	useEffect(() => {
		setIsLoading(true);
		setDevice(devices[deviceName]);
		console.log(deviceName);
		getLogs();
	}, [deviceName]);
	if (isError) {
		return <Error user={user} device={deviceName} devices={devices}/>;
	} else if (isLoading) {
		return <Loading user={user} device={deviceName} devices={devices}/>;
	} else {
		return (
			<View style={styles.container}>
				<ScrollView>
					<Navbar user={user} device={deviceName} devices={devices}/>
					<Devices devices={devices} deviceName={deviceName} setDeviceName={setDeviceName}/>
					<Status data={log}/>
					<View>
						<Text style={textStyles.header}>Latest Log</Text>
						<View style={styles.logContainer}>
							<Table style={styles.table} borderStyle={{borderWidth: 1, borderColor, flex: 1}}>
								{titles.map((key, i) => (<Row
									key={i}
									data={[key, log[key]]}
									widthArr={[150, 70]}
									style={i % 2 ? styles.row : {...styles.row, backgroundColor}}
									textStyle={textStyles.text}
								/>))}
							</Table>
						</View>
					</View>
				</ScrollView>
			</View>);
	}
};
export default Home;

const styles = StyleSheet.create({
	container: {flex: 1, backgroundColor: '#fff'},
	logContainer: {flex: 1, marginVertical: 20},
	table: {alignSelf: 'center', backgroundColor: 'rgba(30,144,255,0.8)', padding: 20, borderRadius: 15},
	head: {height: 40, backgroundColor: '#f1f8ff'},
	row: {height: 28, backgroundColor: 'white'},
});
