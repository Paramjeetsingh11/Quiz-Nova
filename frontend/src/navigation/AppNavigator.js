import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import QuizScreen from '../screens/QuizScreen';
import AIQuizScreen from '../screens/AIQuizScreen';
import BattleScreen from '../screens/BattleScreen';
import AdminScreen from '../screens/AdminScreen';
import TabNavigator from './TabNavigator';

const Stack = createNativeStackNavigator();

const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: 'fade_from_bottom',
        contentStyle: { backgroundColor: '#07000F' },
      }}
    >
      {/* Auth flow */}
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="Signup" component={SignupScreen} options={{ animation: 'slide_from_right' }} />

      {/* Main tabs */}
      <Stack.Screen name="MainTabs" component={TabNavigator} options={{ animation: 'fade' }} />

      {/* Feature screens */}
      <Stack.Screen name="Quiz" component={QuizScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="AIQuiz" component={AIQuizScreen} options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="Battle" component={BattleScreen} options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="Admin" component={AdminScreen} options={{ animation: 'slide_from_right' }} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;
