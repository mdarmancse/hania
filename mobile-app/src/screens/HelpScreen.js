import React from 'react';
import { Header } from 'react-native-elements';
import { colors } from '../common/theme';
import {
    StyleSheet,
    View,
    Text,
    TouchableWithoutFeedback,
    Dimensions,
    Linking,
    Image,
    ScrollView
} from 'react-native';
var { width } = Dimensions.get('window');
import { DrawerActions } from '@react-navigation/native';
import MaterialButtonDark from "../components/MaterialButtonDark";

import i18n from 'i18n-js';


export default function HelpScreen(props) {

    const { t } = i18n;
    const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;
    const onPressmail= () => Linking.openURL('https://tawk.to/chat/62860f5b7b967b1179902ab2/1g3dqo1gs');

    const lCom = { icon: 'grid-outline', type: 'ionicon', color: colors.BLACK, size: 30, component: TouchableWithoutFeedback, onPress: () => { props.navigation.dispatch(DrawerActions.toggleDrawer()); } }
    const rCom = { icon: 'grid-outline', type: 'ionicon', color: colors.BLACK, size: 30, component: TouchableWithoutFeedback, onPress: () => { props.navigation.dispatch(DrawerActions.toggleDrawer()); } }
    return (
        <View style={styles.mainView}>
            <Header
                backgroundColor={colors.HEADER}
                leftComponent={isRTL ? null:lCom}
                rightComponent={isRTL? rCom:null}
                centerComponent={<Text style={styles.headerTitleStyle}>{t('help_screen')}</Text>}
                containerStyle={styles.headerStyle}
                innerContainerStyles={{ marginLeft: 10, marginRight: 10 }}
            />
            <ScrollView>
                <View styles={{ flex: 1 }}>
                    <View style={{ height: 200, width: 200, marginTop: 30, marginBottom: 40, alignSelf: 'center' }}>
                        <Image
                            style={{ width: 200, height: 200, borderRadius: 15 }}
                            source={require('../../assets/images/logo1024x1024.png')}
                        />
                    </View>
                    <View style={{ width: width, paddingLeft: 40, paddingRight: 40 }}>
                        <Text style={{ textAlign: isRTL? 'right':'left', fontSize: 18, alignSelf: 'center', fontFamily: 'Roboto-Bold', lineHeight: 28 }}>
                            {t('help1')} 
                        </Text>
                        <Text style={{ textAlign: isRTL? 'right':'left', fontSize: 18, alignSelf: 'center', fontFamily: 'Roboto-Regular', lineHeight: 28 }}>
                            {t('help2')} 
                        </Text>
                        </View>
                        <View style={styles.help}>
                        <Text style={{ fontSize: 18, marginTop: 40, fontFamily: 'Roboto-Regular', lineHeight: 28 }}>
                            {t('help3')} 
                        </Text>
                        <Text style={{ fontSize: 18, fontFamily: 'Roboto-Regular', lineHeight: 28 }}>
                            {t('help4')} 
                        </Text>
                    </View>
                    <MaterialButtonDark
                onPress={onPressmail}
                style={styles.materialButtonDark}
            >{t('click_here')}</MaterialButtonDark>
                </View>
            </ScrollView>
        </View>
    );
}


const styles = StyleSheet.create({
    mainView: {
        flex: 1,
        backgroundColor: colors.WHITE,
        //marginTop: StatusBar.currentHeight,
    },
    headerStyle: {
        backgroundColor: colors.WHITE,
      borderBottomColor: colors.BLACK,
      elevation: 3,
      borderBottomWidth: 1
    },
    headerTitleStyle: {
        color: colors.BLACK,
        fontFamily: 'Roboto-Bold',
        fontSize: 20
    },
    aboutTitleStyle: {
        color: colors.BLACK,
        fontFamily: 'Roboto-Bold',
        fontSize: 20,
        marginLeft: 8,
        marginTop: 8
    },
    materialButtonDark: {
      height: 50,
      marginTop: 40,
      marginLeft: 40,
      marginRight: 40,
      borderRadius: 5,
      elevation: 3,
      backgroundColor: colors.BLACK,
  },
    aboutcontentmainStyle: {
        marginTop: 12,
        marginBottom: 60
    },
    contact: {
        marginTop: 6,
        marginLeft: 8,
        //flexDirection:'row',
        width: "100%",
        marginBottom: 30
    },
    help:{
      marginHorizontal: 20,
      alignItems: 'center'
    }
})