import {Button, StyleSheet, View} from 'react-native';
import {useState} from 'react';

const Devices = (props) => {
	const devices = props.devices;
	const deviceName = props.deviceName;
	const [isVisible, setIsVisible] = useState(false);

	const handleDeviceChange = (deviceName) => {
		setIsVisible(false);
		props.setDeviceName(deviceName);
	};

	return (<View style={styles.container}>
		<View style={{...styles.button, marginBottom: 5}}>
			<Button
				title={deviceName}
				onPress={() => isVisible ? setIsVisible(false) : setIsVisible(true)}/>
		</View>
		{isVisible && props.setDeviceName && Object.keys(devices).filter((key) => !key.includes(deviceName)).map((key) => (
			<View style={{...styles.button}}><Button
				title={key}
				key={key}
				color={'#5a88b7'}
				onPress={handleDeviceChange.bind(this, key)}/></View>))}</View>);

};
export default Devices;
const styles = StyleSheet.create({
	container: {
		alignItems: 'flex-end', width: '100%', paddingTop: 15, paddingRight: 15,
	}, button: {
		width: 100,
	},
});
