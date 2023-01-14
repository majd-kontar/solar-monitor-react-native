import {Button, StyleSheet, View} from 'react-native';
import strftime from 'strftime';
import {getPreviousDay, getTmrwDate} from '../functions/dateHandler';
import React from 'react';

const NavigationButtons = (props) => {
	const date = props.date;
	return (
		<View style={styles.buttonsContainer}>

			<Button title={strftime('%Y-%m-%d', getTmrwDate(date))}
			        onPress={() => props.setDate(getTmrwDate(date))}
			        disabled={date.toDateString() === new Date().toDateString()}></Button>
			<Button title={'Today'}
			        onPress={() => props.setDate(new Date())}
			        disabled={date.toDateString() === new Date().toDateString()}></Button>
			<Button title={strftime('%Y-%m-%d', getPreviousDay(date))}
			        onPress={() => props.setDate(getPreviousDay(date))}></Button>
		</View>
	);
};
export default NavigationButtons;
const styles = StyleSheet.create({
	buttonsContainer: {
		flexDirection: 'row',
		justifyContent: 'space-evenly',
		paddingBottom: 20,
	},
});
