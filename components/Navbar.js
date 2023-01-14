import {Button, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {textStyles} from '../styles/textStyles';

const Navbar = (props) => {
	const user = props.user;
	const device = props.device;
	const devices = props.devices;
	const navigation = useNavigation();
	const params = {user: user, device: device, devices: devices};
	return (
		<View style={styles.navbarContainer}>
			<Text style={textStyles.title}>Solar Monitor</Text>
			<Button title={'Home'} onPress={() => navigation.navigate('Home', params)}/>
			<Button title={'Logs'} onPress={() => navigation.navigate('Logs', params)}/>
			<Button title={'Summary'} onPress={() => navigation.navigate('Summary', params)}/>
			<Button title={'Analyze'} onPress={() => navigation.navigate('Analyze', params)}/>
			{/*<Button title={'Profile'} onPress={() => navigation.navigate('Profile', params)}/>*/}
			<Button title={'Logout'} onPress={() => navigation.navigate('Login')}/>

		</View>
	);
};
export default Navbar;

const styles = StyleSheet.create({
	navbarContainer: {
		marginTop: 40,
	},
});
