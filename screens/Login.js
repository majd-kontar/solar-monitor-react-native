import {StatusBar} from 'expo-status-bar';
import React, {useState} from 'react';
import {
	StyleSheet,
	Text,
	View,
	Image,
	TextInput,
	Button,
	TouchableOpacity,
} from 'react-native';
import {getDevices, getUser} from '../database';
import sha1 from 'crypto-js/sha1';
import {textStyles} from '../styles/textStyles';

const Login = ({navigation}) => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [message, setMessage] = useState('');

	const handleLogin = async () => {
		const user = await getUser(username.trim());
		if (!username.trim() || !password.trim()) {
			setMessage('Please enter your login credentials!');
		} else if (!user) {
			setMessage('User doesn\'t exist!');
		} else if (user.password === sha1(encodeURI(password.trim())).toString()) {
			setMessage('');
			let devices = await getDevices(username.trim());
			let deviceNames = Object.keys(devices);
			navigation.navigate('Home', {
				user: user,
				devices: devices,
				deviceNames: deviceNames,
				device: deviceNames[0],
			});
		} else {
			setMessage('Invalid Credentials. Please try again.');
		}
	};
	return (
		<View style={styles.container}>
			<Image style={styles.image} source={require('../resources/logo.png')}/>
			<Text style={{...textStyles.title, backgroundColor: 'rgba(238,238,238,0)', color: 'dodgerblue', marginBottom: 20}}>Solar Monitor</Text>
			<StatusBar style="auto"/>
			<Text style={styles.errorMessage}>{message}</Text>
			<View style={styles.inputView}>
				<TextInput
					style={styles.TextInput}
					placeholder="Email."
					placeholderTextColor="#003f5c"
					onChangeText={email => setUsername(email)}
				/>
			</View>
			<View style={styles.inputView}>
				<TextInput
					style={styles.TextInput}
					placeholder="Password."
					placeholderTextColor="#003f5c"
					secureTextEntry={true}
					onChangeText={password => setPassword(password)}
				/>
			</View>
			{/*<TouchableOpacity>*/}
			{/*	<Text style={styles.register_button}>Don't have an account?</Text>*/}
			{/*</TouchableOpacity>*/}
			<TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
				<Text style={{fontSize: 25, color: '#000000'}}>LOGIN</Text>
			</TouchableOpacity>
		</View>
	);
};
export default Login;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		margin: 40,
		// backgroundColor: "#fff",
		alignItems: 'center',
		justifyContent: 'center',
	},
	image: {
		flex: 7,
		resizeMode: 'center',
		height: 200,
		marginBottom: 50,
	},
	errorMessage: {
		marginBottom: 30,
		color: 'red',
		fontSize: 18,
	},
	inputView: {
		flex: 1,
		// backgroundColor: "#75c3f6",
		borderRadius: 20,
		borderWidth: 2,
		borderColor: '#000000',
		width: '70%',
		height: 45,
		marginBottom: 20,
		alignItems: 'center',
	},
	TextInput: {
		height: 50,
		flex: 1,
		padding: 10,
		marginLeft: 20,
	},
	register_button: {
		height: 30,
		marginBottom: 20,
	},
	loginBtn: {
		flex: 1,
		width: '80%',
		borderRadius: 25,
		borderWidth: 2,
		borderColor: '#000000',
		height: 50,
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 20,
		marginBottom: 20,
		backgroundColor: 'dodgerblue',
	},
});
