import React from 'react';
import {Button, StyleSheet, View} from 'react-native';
import Home from './screens/Home';
import Login from './screens/Login';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Summary from './screens/Summary';
import Logs from './screens/Logs';
import Profile from './screens/Profile';

const Stack = createNativeStackNavigator();

const App: () => Node = () => {
	return (
		<NavigationContainer>
			<Stack.Navigator initialRouteName="Login">
				<Stack.Screen name="Login" component={Login} options={{headerShown: false}}/>
				<Stack.Screen name="Home" component={Home} options={{headerShown: false}}/>
				<Stack.Screen name="Logs" component={Logs} options={{headerShown: false}}/>
				<Stack.Screen name="Summary" component={Summary} options={{headerShown: false}}/>
				<Stack.Screen name="Profile" component={Profile} options={{headerShown: false}}/>
			</Stack.Navigator>
		</NavigationContainer>

	);
};


export default App;
