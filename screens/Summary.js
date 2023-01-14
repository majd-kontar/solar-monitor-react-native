import {Button, ScrollView, Text, View, StyleSheet} from 'react-native';
import Navbar from '../components/Navbar';
import React, {useEffect, useRef, useState} from 'react';
import {getAllLogsPerDay, getEnergySummary, getLogsByDay, getLogsToday} from '../shine_monitor_api';
import {Table, TableWrapper, Row, Rows, Col, Cols} from 'react-native-table-component';
import {
	addLogsByDay,
	getDevices,
	retrieveGrid,
	retrieveGridTime, retrieveLastUpdate,
	retrieveLogsByDay,
	retrieveNumOfLogs,
	retrievePVTime,
	updateLastUpdate,
} from '../database';
import strftime from 'strftime';
import {getPreviousDay, getTmrwDate} from '../functions/dateHandler';
import {loadParams} from '../functions/naviagationParamsHandler';
import Loading from '../components/Loading';
import {textStyles} from '../styles/textStyles';
import Devices from '../components/Devices';
import {checkData} from '../functions/dataHandler';
import NavigationButtons from '../components/NavigationButtons';
import Error from '../components/Error';

const borderColor = '#000000';
const backgroundColor = '#eee';

const Summary = ({route, navigation}) => {
	let user, devices, dev, devName;
	try {
		[user, devices, dev, devName] = loadParams(route);
	} catch (e) {
		navigation.navigate('Login');
	}
	const [device, setDevice] = useState(dev);
	const [deviceName, setDeviceName] = useState(devName);
	const [date, setDate] = useState(new Date());
	const [isLoading, setIsLoading] = useState(true);
	const [isError, setIsError] = useState(false);
	const [tableData, setTableData] = useState([]);

	const getLogs = async () => {
			setTableData([]);
			let difference;
			let lastUpdate = await retrieveLastUpdate(user.username, deviceName, strftime('%Y-%m-%d', date));
			console.log('Hours since last update: ' + (lastUpdate ? (lastUpdate - date) / 3600000 : 10) );
			if ((lastUpdate ? (lastUpdate - date) / 3600000 : 10) < 24) {
				await retrieveNumOfLogs(user.username, deviceName, strftime('%Y-%m-%d', date)).then(numOfLogs => difference = checkData(date, numOfLogs));
				if (difference > 90) {
					await getAllLogsPerDay(user, device, strftime('%Y-%m-%d', date)).then(async response => {
						await addLogsByDay(user.username, deviceName, strftime('%Y-%m-%d', date), response);
					});
				} else if (difference > 5) {
					await getLogsByDay(user, device, strftime('%Y-%m-%d', date)).then(async response => {
						await addLogsByDay(user.username, deviceName, strftime('%Y-%m-%d', date), response);
					});
				}

			}
			updateLastUpdate(user.username, deviceName, strftime('%Y-%m-%d', date), new Date());
			const gridTime = await retrieveGridTime(user.username, deviceName, strftime('%Y-%m-%d', date));
			const pvTime = await retrievePVTime(user.username, deviceName, strftime('%Y-%m-%d', date));
			if (date.toDateString() === new Date().toDateString()) {
				const energySummary = await getEnergySummary(user);
				const totalEnergy = energySummary.find(o => o.key === 'ENERGY_TOTAL').val;
				const totalSaved = energySummary.find(o => o.key === 'ENERGY_PROCEEDS').val;
				setTableData([['Grid Time', gridTime], ['PV Time', pvTime], ['Produced Energy', totalEnergy + ' kwh'], ['Saved Amount', totalSaved]]);
			} else {
				setTableData([['Grid Time', gridTime], ['PV Time', pvTime]]);
			}
			setIsLoading(false);
		}
	;

	useEffect(() => {
		setIsLoading(true);
		setDevice(devices[deviceName]);
		console.log(deviceName);
		console.log(date);
		getLogs().catch(() => setIsError(true));
	}, [date, deviceName]);


	if (isError) {
		return <Error user={user} device={deviceName} devices={devices}/>;
	} else if (isLoading) {
		return <Loading user={user} device={deviceName} devices={devices}/>;
	}
	return (<View style={styles.container}>
		<Navbar user={user} device={deviceName} devices={devices}/>
		<Devices devices={devices} deviceName={deviceName} setDeviceName={setDeviceName}/>
		<ScrollView>
			<View>
				<Text style={textStyles.header}>Summary</Text>
				<View style={styles.tableContainer}>
					<Table style={styles.table} borderStyle={{borderWidth: 1, borderColor, flex: 1}}>
						{tableData.map((key, i) => (<Row
							key={i}
							data={key}
							widthArr={[110, 100]}
							style={i % 2 ? styles.row : {...styles.row, backgroundColor}}
							textStyle={textStyles.text}
						/>))}
					</Table>
				</View>
				<NavigationButtons date={date} setDate={setDate}/>
			</View>
		</ScrollView>
	</View>);
};

export default Summary;
const styles = StyleSheet.create({
	container: {flex: 1, paddingBottom: 50, backgroundColor: '#fff'},
	tableContainer: {flex: 1, marginVertical: 20},
	table: {alignSelf: 'center', backgroundColor: 'rgba(30,144,255,0.8)', padding: 20, borderRadius: 15},
	buttonsContainer: {flex: 1, flexDirection: 'row', justifyContent: 'space-evenly'},
	row: {height: 28, backgroundColor: 'white'},
});
