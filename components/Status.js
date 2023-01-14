import {Image, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {textStyles} from '../styles/textStyles';

const Status = (props) => {
	const temp = props.data;
	return (<View>
		<Text style={textStyles.header}>Status</Text>
		<View style={styles.statusContainer}>
			<View style={styles.statusComponent}>
				<Image style={styles.image} source={require('../resources/battery.png')}/>
				<Text style={styles.statusText}>{temp['Battery Charging Current'] > 0 ? 'Charging' : 'Discharging'}</Text>
				<Text style={styles.statusText}>{temp['Battery Voltage']} V</Text>
				<Text style={styles.statusText}>{temp['Battery Capacity']} %</Text>
			</View>
			{parseInt(temp['PV1 Input Voltage']) > 200 &&
				<View style={styles.statusComponent}>
					<Image style={styles.image} source={require('../resources/pv.png')}/>
					<Text style={styles.statusText}>{temp['PV1 Charging Power']} W</Text>
					<Text style={styles.statusText}>{temp['PV1 Input Voltage']} V</Text>
					<Text style={styles.statusText}>{temp['PV1 Input Current']} V</Text>
				</View>}
			{parseInt(temp['Grid Voltage']) > 200 &&
				<View style={styles.statusComponent}>
					<Image style={styles.image} source={require('../resources/grid.png')}/>
					<Text style={styles.statusText}>{temp['Grid Voltage']} V</Text>
				</View>}
			<View style={styles.statusComponent}>
				<Image style={styles.image} source={require('../resources/home.png')}/>
				<Text style={styles.statusText}>{temp['AC Output Active Power']} W</Text>
				<Text style={styles.statusText}>{temp['AC Output Voltage']} V</Text>
				<Text style={styles.statusText}>{(temp['AC Output Active Power'] / temp['AC Output Voltage']).toFixed(2)} A</Text>
			</View>
		</View>
	</View>);
};

export default Status;

const styles = StyleSheet.create({
	image: {
		marginTop: 20, resizeMode: 'center', height: 50,
	}, statusText: {
		textAlign: 'center',
	},
	statusContainer: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-evenly',
		paddingVertical: 10,
		backgroundColor: 'rgba(30,144,255,0.8)',
		borderRadius: 15,
		marginHorizontal: 30,
		marginVertical:10
	},
	statusComponent: {flex: 1, alignItems: 'center'},
});
