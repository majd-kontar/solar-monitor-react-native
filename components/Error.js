import Navbar from './Navbar';
import {Text, View} from 'react-native';
import React from 'react';
import {textStyles} from '../styles/textStyles';
import Devices from './Devices';

const Loading = (props) => {
	const user = props.user;
	const device = props.device;
	const devices = props.devices;
	return (
		<View>
			<Navbar user={user} device={device} devices={devices}/>
			<Devices devices={devices} deviceName={device} setDeviceName={''}/>
			<Text style={{...textStyles.header, marginTop: 150}}>An Error Occurred!</Text>
		</View>);
};

export default Loading;
