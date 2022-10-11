import React, { useState, useRef, useEffect, useContext } from "react";
import {
    StyleSheet,
    View,
    ImageBackground,
    Text,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import MaterialButtonDark from "../components/MaterialButtonDark";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useDispatch, useSelector } from 'react-redux';
import { FirebaseContext } from 'common/src';
import { colors } from '../common/theme';
import { Icon, Button, Header, Input } from 'react-native-elements';
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import RNPickerSelect from 'react-native-picker-select';
import i18n from 'i18n-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment/min/moment-with-locales';


export default function EmailLoginScreen(props) {
    const { api, config } = useContext(FirebaseContext);
    const auth = useSelector(state => state.auth);
    const settings = useSelector(state => state.settingsdata.settings);
    const dispatch = useDispatch();



    const pageActive = useRef(false);
    const recaptchaVerifier = useRef(null);

    const { t } = i18n;
    const [isRTL,setIsRTL] = useState();
    const [langSelection, setLangSelection] = useState();
    const languagedata = useSelector(state => state.languagedata);
    
    useEffect(() => {
        AsyncStorage.getItem('lang', (err, result) => {
            if(result){
                const langLocale = JSON.parse(result)['langLocale']
                setIsRTL(langLocale == 'he' || langLocale == 'ar')
                setLangSelection(langLocale);
            }else{
                setIsRTL(i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0)
                setLangSelection(i18n.locale);
            }
        });
    }, []);


    const onSignIn = async () => {
        pageActive.current = false;
        props.navigation.navigate("Login2");
    }

    return (

        <KeyboardAvoidingView behavior={"position"} style={styles.container}>
            <ImageBackground
                source={require('../../assets/images/bg.png')}
                resizeMode="stretch"
                style={styles.imagebg}
            >
                <FirebaseRecaptchaVerifierModal
                    ref={recaptchaVerifier}
                    firebaseConfig={config}
                    androidHardwareAccelerationDisabled
                    attemptInvisibleVerification={true}
                />
                <View style={styles.topBar}>
                </View>
                <View style={[styles.headLanuage,[isRTL?{left:10}:{right: 10}]]}>
                <Text style={{ color: colors.BLACK, marginLeft: 3 }}></Text>
                {langSelection && languagedata && languagedata.langlist ?
                    <RNPickerSelect
                        placeholder={{}}
                        value={langSelection}
                        useNativeAndroidPickerStyle={false}
                        
                        style={{
                            inputIOS: styles.pickerStyle1,
                            inputAndroid: styles.pickerStyle1,
                            placeholder: {
                                color: 'black'
                            },

                        }}
                        onValueChange={
                            (text) => {
                                let defl = null;
                                for (const value of Object.values(languagedata.langlist)) {
                                   if(value.langLocale == text){
                                      defl = value;
                                   }
                                }
                                setLangSelection(text);
                                i18n.locale = text;
                                moment.locale(defl.dateLocale);
                                setIsRTL(text == 'he' || text == 'ar')
                                AsyncStorage.setItem('lang', JSON.stringify({langLocale:text,dateLocale:defl.dateLocale }));
                            }
                        }
                        label={"Language"}
                        items={Object.values(languagedata.langlist).map(function (value) { return { label: value.langName, value: value.langLocale }; })}
                        Icon={() => { return <Ionicons style={{ marginTop: 3,}} name="md-arrow-down" size={20} color="black" />; }}
                    />
                    : null}
                </View>
                
                <View style={styles.texter}>
                        <Text style={styles.text1}>{t('welcome')}</Text>
                        <Text style={styles.text2}>{t('welcome2')}</Text>
                        <Text style={styles.text3}>{t('welcome3')}</Text>
                        <Text style={styles.text4}>{t('welcome4')}</Text>
                        <Text style={styles.text5}>{t('welcome5')}</Text>
                    </View>
                    <View style={styles.buttonContainer}>
                            <Button
                                onPress={onSignIn}
                                title={t('started')}
                                loading={props.loading}
                                titleStyle={styles.buttonTitle}
                                buttonStyle={[styles.materialButtonDark]}
                            />
                        </View>
            </ImageBackground>
        </KeyboardAvoidingView>

    );
}

const styles = StyleSheet.create({
    loading: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 40
    },
    container: {
        flex: 1,
    },
    buttonTitle: {
        fontSize: 18,
        color: colors.BLACK
    },
    imagebg: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height + (Platform.OS == 'android' ? 40 : 0),
    },
    topBar: {
        marginTop: 0,
        marginLeft: 0,
        marginRight: 0,
        height: (Dimensions.get('window').height * 0.52) + (Platform.OS == 'android' ? 40 : 0),
    },
    backButton: {
        height: 40,
        width: 40,
        marginTop: 30,
    },
    segmentcontrol: {
        color: colors.WHITE,
        fontSize: 18,
        fontFamily: "Roboto-Regular",
        marginTop: 0,
        alignSelf: "center",
        height: 50,
        marginLeft: 35,
        marginRight: 35
    },

    box1: {
        height: 35,
        backgroundColor: colors.WHITE,
        marginTop: 26,
        marginLeft: 35,
        marginRight: 35,
        borderWidth: 1,
        borderColor: colors.BORDER_BACKGROUND,
        justifyContent: 'center'
    },
    box2: {
        height: 35,
        backgroundColor: colors.WHITE,
        marginTop: 12,
        marginLeft: 35,
        marginRight: 35,
        borderWidth: 1,
        borderColor: colors.BORDER_BACKGROUND,
        justifyContent: 'center'
    },
    textInput: {
        color: colors.BACKGROUND,
        fontSize: 18,
        fontFamily: "Roboto-Regular",
        //textAlign: "left",
        marginTop: 8,
        marginLeft: 5
    },
    materialButtonDark: {
        height: 50,
        marginTop: 50,
        marginLeft: 35,
        marginRight: 35,
        borderColor: colors.NEW,
        borderWidth: 2,
        borderRadius: 5,
        backgroundColor: colors.WHITE,
    },
    linkBar: {
        flexDirection: "row",
        marginTop: 30,
        alignSelf: 'center'
    },
    barLinks: {
        marginLeft: 15,
        marginRight: 15,
        alignSelf: "center",
        fontSize: 18,
        fontWeight: 'bold'
    },
    linkText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.WHITE,
        fontFamily: "Roboto-Bold",
    },
    pickerStyle: {
        color: colors.BACKGROUND,
        fontFamily: "Roboto-Regular",
        fontSize: 18,
        marginLeft: 5,
    },

    actionLine: {
        height: 20,
        flexDirection: "row",
        marginTop: 20,
        alignSelf: 'center'
    },
    actionItem: {
        height: 20,
        marginLeft: 15,
        marginRight: 15,
        alignSelf: "center"
    },
    actionText: {
        fontSize: 15,
        fontFamily: "Roboto-Regular",
        fontWeight: 'bold'
    },
    actionLine: {
        height: 20,
        flexDirection: "row",
        marginTop: 20,
        alignSelf: 'center'
    },
    actionItem: {
        height: 20,
        marginLeft: 15,
        marginRight: 15,
        alignSelf: "center"
    },
    actionText: {
        fontSize: 16,
        fontFamily: "Roboto-Regular",
        fontWeight: 'bold'
    },
    seperator: {
        width: 250,
        height: 20,
        flexDirection: "row",
        marginTop: 20,
        alignSelf: 'center'
    },
    lineLeft: {
        width: 50,
        height: 1,
        backgroundColor: "rgba(113,113,113,1)",
        marginTop: 9
    },
    sepText: {
        color: colors.BLACK,
        fontSize: 14,
        fontFamily: "Roboto-Regular",
        opacity: .8
    },
    lineLeftFiller: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center"
    },
    lineRight: {
        width: 50,
        height: 1,
        backgroundColor: "rgba(113,113,113,1)",
        marginTop: 9
    },
    socialBar: {
        height: 40,
        flexDirection: "row",
        marginTop: 15,
        alignSelf: 'center'
    },
    socialIcon: {
        width: 40,
        height: 40,
        marginLeft: 15,
        marginRight: 15,
        alignSelf: "center"
    },
    socialIconImage: {
        width: 40,
        height: 40
    },
    footer: {
        marginTop: 20,
        flexDirection:'row',
        justifyContent: 'space-evenly'
    },
    terms: {
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: "center",
        opacity: .65
    },
    pickerStyle1: {
        color: colors.BLACK,
        width: 68,
        fontSize: 15,
        height: 30,
        fontWeight: 'bold',
    },
    headLanuage:{
        position:'absolute',
        top:50,
        borderColor: colors.BLACK,
        flexDirection:'row',
        borderWidth:0.4,
        borderRadius: 5,
        alignItems:'center'
    },
    texter:{
        alignItems: 'center',
    },
    text1:{
        fontSize: 18,
        fontFamily: "Roboto-Regular",
        color: colors.BLACK
    },
    text2:{
        fontSize: 24,
        fontFamily: "Roboto-Bold",
        marginHorizontal: 40,
        alignSelf: 'center',
        justifyContent: 'center',
        color: colors.BLACK
    },
    text3:{
        fontSize: 16,
        marginTop: 20,
        fontFamily: "Roboto-Regular",
        color: colors.BLACK
    },
    text4:{
        fontSize: 16,
        fontFamily: "Roboto-Regular",
        color: colors.BLACK
    },
    text5:{
        fontSize: 16,
        fontFamily: "Roboto-Regular",
        color: colors.BLACK
    },
});