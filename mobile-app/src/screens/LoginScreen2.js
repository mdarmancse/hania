import React, { useState, useRef, useEffect, useContext } from "react";
import {
    StyleSheet,
    View,
    ImageBackground,
    Text,
    Dimensions,
    KeyboardAvoidingView,
    Alert,
    TextInput,
    Image,
    ActivityIndicator,
    Platform,
    Linking
} from "react-native";
import MaterialButtonDark from "../components/MaterialButtonDark";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useDispatch, useSelector } from 'react-redux';
import { FirebaseContext } from 'common/src';
import PhoneInput from "react-native-phone-number-input";
import { colors } from '../common/theme';
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import RNPickerSelect from 'react-native-picker-select';
import * as Facebook from 'expo-facebook';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from "expo-crypto";
import Constants from "expo-constants";
import i18n from 'i18n-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment/min/moment-with-locales';


export default function EmailLoginScreen(props) {
    const { api, config } = useContext(FirebaseContext);
    const {
        clearLoginError,
        requestPhoneOtpDevice,
        mobileSignIn,
        countries,
        facebookSignIn,
        appleSignIn
    } = api;
    const auth = useSelector(state => state.auth);
    const settings = useSelector(state => state.settingsdata.settings);
    const dispatch = useDispatch();

    const formatCountries = () => {
        let arr = [];
        for (let i = 0; i < countries.length; i++) {
            let txt = countries[i].label + " (+" + countries[i].phone + ")";
            arr.push({ label: txt, value: txt, key: txt });
        }
        return arr;
    }

    const [state, setState] = useState({
        phoneNumber: null,
        verificationId: null,
        verificationCode: null,
        countryCodeList: formatCountries(),
        countryCode: null
    });

    const pageActive = useRef(false);
    const [loading, setLoading] = useState(false);
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

    useEffect(() => {
        if (settings) {
            for (let i = 0; i < countries.length; i++) {
                if (countries[i].label == settings.country) {
                    setState({ ...state, countryCode: settings.country + " (+" + countries[i].phone + ")" })
                }
            }
        }
    }, [settings]);

    useEffect(() => {
        if (auth.info && pageActive.current) {
            pageActive.current = false;
            setLoading(false);
        }
        if (auth.error && auth.error.msg && pageActive.current && auth.error.msg.message !== t('not_logged_in')) {
            pageActive.current = false;
            setState({ ...state, verificationCode: '' });
            if (auth.error.msg.message === t('require_approval')) {
                Alert.alert(t('alert'), t('require_approval'));
            } else {
                Alert.alert(t('alert'), t('login_error'));
            }
            dispatch(clearLoginError());
            setLoading(false);
        }
        if (auth.verificationId) {
            pageActive.current = false;
            setState({ ...state, verificationId: auth.verificationId });
            setLoading(false);
        }
    }, [auth.info, auth.error, auth.error.msg, auth.verificationId]);

    const onPressLogin = async () => {
        setLoading(true);
            if (state.phoneNumber) {
                let formattedNum = state.phoneNumber.replace(/ /g, '');
                formattedNum =  phoneNumber.replace(/-/g, '');
                if (formattedNum.length > 8) {
                    pageActive.current = true;
                    dispatch(requestPhoneOtpDevice(formattedNum, recaptchaVerifier.current));
                } else {
                    Alert.alert(t('alert'), t('mobile_no_blank_error'));
                    setLoading(false);
                }
            } else {
                Alert.alert(t('alert'), t('mobile_no_blank_error'));
                setLoading(false);
            }
        }

    const [phoneNumber, setphoneNumber] = useState ('');

    const onSignIn = async () => {
        if(state.verificationCode){
            setLoading(true);
            pageActive.current = true;
            dispatch(mobileSignIn(
                state.verificationId,
                state.verificationCode
            ));
        }else{
            Alert.alert(t('alert'), t('otp_blank_error'));
            setLoading(false);
        }
    }

    const CancelLogin = () => {
        setState({
            ...state,
            phoneNumber: null,
            verificationId: null,
            verificationCode: null
        });
    }


    const FbLogin = async () => {
        try {
            await Facebook.initializeAsync({ appId: Constants.manifest.facebookAppId });
            const {
                type,
                token
            } = await Facebook.logInWithReadPermissionsAsync({
                permissions: ['public_profile', "email"],
            });
            if (type === 'success') {
                pageActive.current = true;
                dispatch(facebookSignIn(token));
            }
            else {
                Alert.alert(t('alert'), t('facebook_login_auth_error'));
            }
        } catch ({ message }) {
            Alert.alert(t('alert'), t('facebook_login_auth_error') + ' ' + message);
        }
    }

    const AppleLogin = async () => {
        const csrf = Math.random().toString(36).substring(2, 15);
        const nonce = Math.random().toString(36).substring(2, 10);
        const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, nonce);
        try {
            const applelogincredentials = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
                state: csrf,
                nonce: hashedNonce
            });

            pageActive.current = true;
            dispatch(appleSignIn({
                idToken: applelogincredentials.identityToken,
                rawNonce: nonce,
            }));

        } catch (error) {
            if (error.code === 'ERR_CANCELED') {
                console.log(error);
            } else {
                Alert.alert(t('alert'), t('apple_signin_error'));
            }
        }
    }

    const openRegister = () => {
        pageActive.current = false;
        props.navigation.navigate("Register");
    }

    const openTerms = async () => {
        Linking.openURL(settings.CompanyTerms).catch(err => console.error("Couldn't load page", err));
    }

    return (

        <KeyboardAvoidingView behavior={"padding"} style={styles.container}>
            <ImageBackground
                source={require('../../assets/images/bg2.png')}
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
                <View style={[styles.texter, { textAlign: isRTL ? "right" : "left" }]}>
                        <Text style={styles.text2}>{t('login1')}</Text>
                    </View>
                <View style={[styles.box1]}>
                <PhoneInput
                            defaultValue={phoneNumber}
                            defaultCode="DZ"
                            layout="first"
                            placeholder={t('mobile_no_placeholder')}
                            value={state.phoneNumber}
                            onChangeText={(value) => setState({ ...state, phoneNumber: value })}
                            textContainerStyle={{paddingVertical : 0, backgroundColor : 'white',}}
                            onChangeFormattedText={text =>{
                                setphoneNumber(text);
                            }}
                        />
                </View>

                {state.verificationId ? null :
                    <MaterialButtonDark
                        onPress={onPressLogin}
                        style={styles.materialButtonDark}
                    >{t('request_otp')}</MaterialButtonDark>
                }
                {!!state.verificationId ?
                    <View style={styles.box2}>
                        <TextInput
                            style={[styles.textInput2, { textAlign: isRTL ? "right" : "left" }]}
                            placeholder={t('otp_here')}
                            placeholderTextColor="black"
                            onChangeText={(value) => setState({ ...state, verificationCode: value })}
                            value={state.verificationCode}
                            ditable={!!state.verificationId}
                            keyboardType="phone-pad"
                            secureTextEntry={true}
                        />
                    </View>
                    : null}
                    <TouchableOpacity style={styles.terms1} onPress={openTerms}>
                    <Text style={styles.actionText1}>{t('terms1')}</Text>
                </TouchableOpacity>
                {!!state.verificationId ?
                    <MaterialButtonDark
                        onPress={onSignIn}
                        style={styles.materialButtonDark}
                    >{t('authorize')}</MaterialButtonDark>
                    : null}
                {state.verificationId ?
                    <View style={styles.actionLine}>
                        <TouchableOpacity style={styles.actionItem} onPress={CancelLogin}>
                            <Text style={styles.actionText2}>{t('resent')}</Text>
                        </TouchableOpacity>
                    </View>
                    : null}
                {loading ?
                    <View style={styles.loading}>
                        <ActivityIndicator color={colors.BLACK} size='large' />
                    </View>
                    : null}
                {(Platform.OS == 'ios' && settings && settings.AppleLoginEnabled) || (settings && settings.FacebookLoginEnabled) ?
                <View style={styles.seperator}>
                    <View style={styles.lineLeft}></View>
                    <View style={styles.lineLeftFiller}>
                        <Text style={styles.sepText}>{t('spacer_message')}</Text>
                    </View>
                    <View style={styles.lineRight}></View>
                </View>
                : null}

            {(Platform.OS == 'ios' && settings && settings.AppleLoginEnabled) || (settings && settings.FacebookLoginEnabled) ?
                <View style={styles.socialBar}>
                    {settings && settings.FacebookLoginEnabled ?
                        <TouchableOpacity style={styles.socialIcon} onPress={FbLogin}>
                            <Image
                                source={require("../../assets/images/image_fb.png")}
                                resizeMode="contain"
                                style={styles.socialIconImage}
                            ></Image>
                        </TouchableOpacity>
                        : null}
                    {Platform.OS == 'ios' && settings.AppleLoginEnabled ?
                        <TouchableOpacity style={styles.socialIcon} onPress={AppleLogin}>
                            <Image
                                source={require("../../assets/images/image_apple.png")}
                                resizeMode="contain"
                                style={styles.socialIconImage}
                            ></Image>
                        </TouchableOpacity>
                        : null}
                </View>
                : null}
            <View style={styles.footer}>
            <MaterialButtonDark
                        onPress={openRegister}
                        style={styles.materialButtonDark2}
                    >{t('register_as_driver')}</MaterialButtonDark>
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
        height: (Dimensions.get('window').height * 0.04) + (Platform.OS == 'android' ? 40 : 0),
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
        height: 40,
        backgroundColor: colors.WHITE,
        marginTop: 12,
        marginLeft: 25,
        marginRight: 25,
        borderWidth: 1,
        borderRadius: 5,
        borderColor: colors.BORDER_BACKGROUND,
        justifyContent: 'center'
    },
    box2: {
        height: 40,
        backgroundColor: colors.WHITE,
        marginTop: 12,
        marginLeft: 25,
        marginRight: 25,
        borderWidth: 1,
        borderColor: colors.BORDER_BACKGROUND,
        justifyContent: 'center'
    },
    textInput: {
        color: colors.BLACK,
        fontSize: 18,
        fontFamily: "Roboto-Regular",
        //textAlign: "left",
        marginTop: 8,
        marginLeft: 10
    },
    textInput2: {
        color: colors.BLACK,
        fontSize: 16,
        fontFamily: "Roboto-Regular",
        //textAlign: "left",
        marginTop: 8,
        marginLeft: 10,
        marginRight: 10
    },
    materialButtonDark: {
        height: 35,
        marginTop: 22,
        marginLeft: 35,
        marginRight: 35,
        borderRadius: 5,
        backgroundColor: colors.BLACK,
    },
    materialButtonDark2: {
        height: 50,
        width: 250,
        marginTop: 22,
        marginLeft: 35,
        marginRight: 35,
        borderRadius: 5,
        backgroundColor: colors.NEW,
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
        marginLeft: 15,
        marginRight: 15,
        alignSelf: "center"
    },
    actionText: {
        fontSize: 15,
        color: colors.BLACK,
        fontFamily: "Roboto-Regular",
        fontWeight: 'bold'
    },
    actionText1: {
        fontSize: 12,
        color: colors.BLACK,
        fontFamily: "Roboto-Regular",
    },
    actionText2: {
        fontSize: 12,
        color: colors.BLACK,
        fontFamily: "Roboto-Bold",
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
        color: colors.BLACK,
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
        fontSize: 10,
        fontFamily: "Roboto-Regular",
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
    terms1: {
        marginTop: 10,
        marginHorizontal: 30,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: "center",
    },
    pickerStyle1: {
        color: colors.BLACK,
        width: 75,
        fontSize: 15,
        height: 30,
        fontWeight: 'bold',
    },
    texter:{
        marginRight:25,
        marginLeft: 25,
    },
    text2:{
        fontSize: 20,
        fontFamily: "Roboto-Bold",
        color: colors.BLACK
    },
});