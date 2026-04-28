import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import * as SplashScreenExpo from 'expo-splash-screen';
import AppNavigator from './src/navigation/AppNavigator';

SplashScreenExpo.preventAutoHideAsync();

export default function App() {
  useEffect(() => {
    SplashScreenExpo.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <AppNavigator />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#07000F' },
});
