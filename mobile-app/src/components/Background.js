import React from 'react';
import {
  StyleSheet,
  ImageBackground
} from 'react-native';

export default function Background(props) {
  return (
    <ImageBackground style={styles.imgBackground}
      resizeMode='cover'
      source={require('../../assets/images/bg2.png')}>
      {props.children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  imgBackground: {
    width: '100%',
    height: '100%',
    flex: 1
  }
});
