import {Button, ScrollView, Text, View, StyleSheet} from 'react-native';
import Navbar from '../components/Navbar';
import React, {useEffect, useRef, useState} from 'react';
import {getAllLogsPerDay, getLogsByDay, getLogsToday} from '../shine_monitor_api';
import {Table, TableWrapper, Row, Rows, Col, Cols} from 'react-native-table-component';
import {addLogsByDay, getDevices, retrieveLastUpdate, retrieveLatestLog, retrieveLogsByDay, retrieveNumOfLogs, updateLastUpdate} from '../database';
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
const primaryColor = 'dodgerblue';
const backgroundColor = '#eee';

const Logs = ({route, navigation}) => {
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
	const [tableHead, setTableHead] = useState([]);
	const [tableTitle, setTableTitle] = useState([]);
	const [tableData, setTableData] = useState([]);
	const [widthArr, setWidthArr] = useState([]);
	const titles = ['AC Output Active Power', 'Output Load Percent', 'Battery Capacity', 'Battery Voltage', 'Battery Charging Current', 'Battery Discharge Current', 'PV1 Charging Power', 'PV1 Input Voltage', 'PV1 Input Current', 'AC Output Voltage', 'Grid Voltage'];
	const leftRef = useRef(null);
	const rightRef = useRef(null);

	const headerHeight = 40;
	const leftColumnWidth = 150;

	const getLogs = async () => {
		console.log('gettingLogs');
		setTableData([]);
		setTableTitle([]);
		let keys, data;
		let difference;
		let lastUpdate = await retrieveLastUpdate(user.username, deviceName, strftime('%Y-%m-%d', date));
		if ((lastUpdate ? (lastUpdate - date) / 3600000 : 10) < 24) {
			await retrieveNumOfLogs(user.username, deviceName, strftime('%Y-%m-%d', date)).then(numOfLogs => difference = checkData(date, numOfLogs));
			if (difference > 90) {
				await getAllLogsPerDay(user, device, strftime('%Y-%m-%d', date)).then(async response => {
					addLogsByDay(user.username, deviceName, strftime('%Y-%m-%d', date), response);
					keys = Object.keys(response);
					data = response;
				});
			} else if (difference > 3) {
				await getLogsByDay(user, device, strftime('%Y-%m-%d', date)).then(async response => {
					addLogsByDay(user.username, deviceName, strftime('%Y-%m-%d', date), response);
					keys = Object.keys(response);
					data = response;
				});
			} else {
				await retrieveLogsByDay(user.username, deviceName, strftime('%Y-%m-%d', date)).then(async response => {
					keys = Object.keys(response);
					data = response;
				});
			}
		} else {
			await retrieveLogsByDay(user.username, deviceName, strftime('%Y-%m-%d', date)).then(async response => {
				keys = Object.keys(response);
				data = response;
			});
		}
		updateLastUpdate(user.username, deviceName, strftime('%Y-%m-%d', date), new Date());
		console.log('GeneratingTable');
		setTableHead(keys);
		setWidthArr(Array(keys.length).fill(100));
		titles.forEach(title => {
			let rowData = [];
			keys.forEach(key => {
				rowData.push(data[key][title]);
			});
			setTableData(tableData => [...tableData, rowData]);
			setTableTitle(tableTitle => [...tableTitle, [title]]);
		});
		setIsLoading(false);
		console.log('Done');
	};


	useEffect(() => {
		setIsLoading(true);
		setDevice(devices[deviceName]);
		console.log(deviceName);
		console.log(date);
		getLogs().catch(() => {
			setIsError(true);
		});
	}, [date, deviceName]);


	if (isError) {
		return <Error user={user} device={deviceName} devices={devices}/>;
	} else if (isLoading) {
		return <Loading user={user} device={deviceName} devices={devices}/>;
	} else {
		return (<View style={styles.main}>
			<ScrollView>
				<Navbar user={user} device={deviceName} devices={devices}/>
				<Devices devices={devices} deviceName={deviceName} setDeviceName={setDeviceName}/>
				<Text style={textStyles.header}>Logs</Text>
				<View style={styles.container}>
					<View style={{
						width: leftColumnWidth, backgroundColor: '#eee', borderRightWidth: 1, borderRightColor: borderColor,
					}}>
						{/* Blank Cell */}
						<View style={{
							height: headerHeight, backgroundColor: primaryColor, borderBottomWidth: 1, borderBottomColor: borderColor,
						}}></View>
						<ScrollView
							ref={leftRef}
							style={{
								flex: 1, backgroundColor: '#eee',
							}}
							scrollEnabled={false}
							showsVerticalScrollIndicator={false}
						>
							<Table borderStyle={{
								borderWidth: 1, borderColor,
							}}>
								{tableTitle.map((rowData, index) => (<Row
									key={index}
									data={rowData}
									widthArr={[leftColumnWidth]}
									style={index % 2 ? styles.row : {...styles.row, backgroundColor}}
									textStyle={textStyles.text}
								/>))}
							</Table>
						</ScrollView>
					</View>
					<View style={{
						flex: 1, backgroundColor: '#eee',
					}}>
						<ScrollView horizontal={true} bounces={false}>
							<View>
								<Table borderStyle={{borderWidth: 1, borderColor}}>
									<Row
										data={tableHead}
										widthArr={widthArr}
										style={styles.head}
										textStyle={{...textStyles.text, color: 'white'}}
									/>
								</Table>
								<ScrollView
									style={styles.dataWrapper}
									scrollEventThrottle={16}
									bounces={false}
									onScroll={(e) => {
										const {y} = e.nativeEvent.contentOffset;
										leftRef.current?.scrollTo({y, animated: false});
									}}
								>
									<Table borderStyle={{borderWidth: 1, borderColor}}>
										{tableData.map((rowData, index) => (<Row
											key={index}
											data={rowData}
											widthArr={widthArr}
											style={index % 2 ? styles.row : {...styles.row, backgroundColor}}
											textStyle={textStyles.text}
										/>))}
									</Table>
								</ScrollView>
							</View>

						</ScrollView>
					</View>
				</View>
				<NavigationButtons date={date} setDate={setDate}/>
			</ScrollView>
		</View>);
	}
};
export default Logs;
const styles = StyleSheet.create({
	main: {
		flex: 1, backgroundColor: '#eee',
	}, container: {
		flex: 4, flexDirection: 'row', padding: 15, height: '100%', backgroundColor: '#eee',
	}, buttonsContainer: {flexDirection: 'row', justifyContent: 'space-evenly', paddingBottom: 20}, head: {
		height: 40, backgroundColor: primaryColor,
	}, wrapper: {
		flexDirection: 'row',
	}, dataWrapper: {
		marginTop: -1,
	}, title: {
		flex: 1, backgroundColor: '#f6f8fa',
	}, row: {
		height: 28, backgroundColor: 'white',
	},
});
