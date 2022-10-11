import React from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../common/theme';

export default function AuthLoadingScreen(props) {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/images/intro.png')}
        resizeMode="stretch"
        style={styles.imagebg}
      >
        <ActivityIndicator style={{ paddingBottom: 100 }} color={colors.INDICATOR_BLUE} size='large' />
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: 'center'
  },
  imagebg: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: Dimensions.get('window').width,
    height: "100%",
    justifyContent: "flex-end",
    alignItems: 'center'
  }
});