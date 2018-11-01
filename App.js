/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Caroucel from './Caroucel';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

const dataItems = [
  { backgroundColor: 'yellow' },
  { backgroundColor: 'coral' },
  { backgroundColor: 'lightgreen' },
  { backgroundColor: 'indigo' },
];

export default class App extends Component {
  _renderItem = ({ item, index }) => {
    return <View key={index} style={[styles.rect, item]} />;
  };

  render() {
    return (
      <View style={styles.container}>
        <Caroucel data={dataItems} renderItem={this._renderItem} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    //alignItems: 'center',
    backgroundColor: '#F5FCFF',
    paddingTop: 64,
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  rect: {
    height: 250,
  },
});
