import React, {useState, useContext} from 'react';
import {View, Text, FlatList, StyleSheet, TouchableOpacity, Image, ScrollView, Alert} from 'react-native';
import {Button, Icon} from 'react-native-elements'
import { colors } from '../common/theme';
import i18n from 'i18n-js';
import {useDispatch, useSelector} from 'react-redux';
import SegmentedControlTab from 'react-native-segmented-control-tab';
import moment from 'moment/min/moment-with-locales';
import { FirebaseContext } from 'common/src';
import { useNavigation } from '@react-navigation/native';

export default function Bklist(props) {
    const navigation = useNavigation();
   // console.log(props)
   //  const {data}  = props.route.params;
    //  const paramData = data;
    const { t } = i18n;
    const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;
    const { api, appcat } = useContext(FirebaseContext);
    const {
        acceptTask
    } = api;
    const dispatch = useDispatch();
    const settings = useSelector(state => state.settingsdata.settings);
    const auth = useSelector(state => state.auth);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [activeBookings, setActiveBookings] = useState([]);
    const [tabIndex,setTabIndex] = useState(props.tabIndex);

    const onPressButton = (item, index) => {
        props.onPressButton(item, index)
    };

    const onPressAccept = (item) => {
        let wallet_balance = parseFloat(auth.info.profile.walletBalance);
        if (!settings.negativeBalance && wallet_balance <= 0) {
            if(appcat == 'delivery' && item.prepaid && item.payment_mode == 'card'){
                dispatch(acceptTask(auth.info, item));
                setSelectedItem(null);
                setModalVisible(null);
                setTimeout(() => {
                    props.navigation.navigate('BookedCab', { bookingId: item.id });
                }, 3000)
            } else{
                Alert.alert(
                    t('alert'),
                    t('wallet_balance_zero')
                );
            }
        }
        else if(!settings.negativeBalance && wallet_balance > 0 && wallet_balance < item.convenience_fees){
            if(appcat == 'delivery' && item.prepaid && item.payment_mode == 'card'){
                dispatch(acceptTask(auth.info, item));
                setSelectedItem(null);
                setModalVisible(null);
                setTimeout(() => {
                    navigation.navigate('BookedCab',{bookingId: item.id });

                }, 3000)
            } else{
                Alert.alert(
                    t('alert'),
                    t('wallet_balance_low')
                );
            }
        } else {
            dispatch(acceptTask(auth.info, item));
            setSelectedItem(null);
            setModalVisible(null);
            setTimeout(() => {
                navigation.navigate('BookedCab',{bookingId: item.id });
                // props.navigation.navigate('BookedCab', { bookingId: item.id });
            }, 3000)
        }
    };

    const goToBooking = (id) => {
       // props.navigation.goBack();
         navigation.navigate('BookedCab',{bookingId:id});
    };

    
    const renderData = ({ item, index }) => {

        if (item.bookLater == true && item.status == "NEW" ) {

            return (
                <TouchableOpacity style={[styles.iconClickStyle, {flexDirection: isRTL ? 'row-reverse' : 'row'}]}
                                  onPress={() => onPressButton(item, index)}>
                    <View style={styles.iconViewStyle}>
                        {appcat == 'delivery' ?
                            <Icon
                                name='truck-fast'
                                type='material-community'
                                color={colors.BLACK}
                                size={35}
                            />
                            :
                            <Icon
                                name='car-sports'
                                type='material-community'
                                color={colors.HEADER}
                                size={35}
                            />
                        }
                    </View>
                    <View style={[styles.flexViewStyle, isRTL ? {
                        flexDirection: 'row-reverse',
                        marginRight: 5
                    } : {flexDirection: 'row', marginLeft: 5}]}>
                        <View style={styles.textView1}>

                            <Text
                                style={[styles.textStyle, styles.dateStyle, {textAlign: isRTL ? "right" : "left"}]}>{item.bookingDate ? moment(item.tripdate).format('lll') : ''}</Text>
                            <View style={[isRTL ? {flexDirection: 'row-reverse'} : {flexDirection: 'row'}]}>
                                <Text
                                    style={[styles.textStyle, styles.carNoStyle, {textAlign: isRTL ? "right" : "left"}]}> {isRTL ? '-' : null} {item.carType ? item.carType : null} {isRTL ? null : '- '}</Text>
                                <Text
                                    style={[styles.textStyle, styles.carNoStyle, {textAlign: isRTL ? "right" : "left"}]}>{item.vehicle_number ? item.vehicle_number : t('no_car_assign_text')}</Text>
                            </View>
                            <View
                                style={[styles.dropStyle, styles.textViewStyle, {flexDirection: isRTL ? 'row-reverse' : 'row'}]}>
                                <View style={[styles.blackDot, styles.textPosition]}/>
                                <Text style={[styles.dropPlaceStyle, styles.placeStyle, isRTL ? {
                                    textAlign: "right",
                                    marginRight: 10
                                } : {
                                    textAlign: "left",
                                    marginLeft: 10
                                }]}>{item.trip_cost ? 'Price: '+ item.status :t('not_found_text')}</Text>
                            </View>
                            <View
                                style={[styles.picupStyle, styles.position, {flexDirection: isRTL ? 'row-reverse' : 'row'}]}>

                                <View style={styles.greenDot}/>
                                <Text style={[styles.picPlaceStyle, styles.placeStyle, isRTL ? {
                                    textAlign: "right",
                                    marginRight: 10
                                } : {
                                    textAlign: "left",
                                    marginLeft: 10
                                }]}>{item.pickup ? item.pickup.add : t('not_found_text')}</Text>
                            </View>
                            <View
                                style={[styles.dropStyle, styles.textViewStyle, {flexDirection: isRTL ? 'row-reverse' : 'row'}]}>
                                <View style={[styles.redDot, styles.textPosition]}/>
                                <Text style={[styles.dropPlaceStyle, styles.placeStyle, isRTL ? {
                                    textAlign: "right",
                                    marginRight: 10
                                } : {
                                    textAlign: "left",
                                    marginLeft: 10
                                }]}>{item.drop ? item.drop.add : t('not_found_text')}</Text>
                            </View>

                        </View>
                        <View style={styles.textView2}>
                            <TouchableOpacity
                                // onPress={() => props.navigation.navigate('DrawerOpen')}>
                                 onPress={() => onPressAccept(item)}>
                                <Text style={styles.accept}>{t('accept')}</Text>
                            </TouchableOpacity>

                            {/*<Button*/}
                            {/*    title={t('go_to_booking')}*/}
                            {/*    loading={false}*/}
                            {/*    loadingProps={{ size: "large", color: colors.GREEN_DOT }}*/}
                            {/*    titleStyle={styles.buttonTitleText2}*/}
                            {/*    onPress={() => { goToBooking(item.id) }}*/}
                            {/*    buttonStyle={styles.buttons}*/}
                            {/*    containerStyle={styles.paynowButton}*/}
                            {/*/>*/}
                        </View>
                    </View>
                </TouchableOpacity>

            )

        }
    }

       
    return (
        <View style={styles.textView3}>

            <FlatList
                keyExtractor={(item, index) => index.toString()}
                data={tabIndex===0? props.data.filter(item=> !(item.status==='CANCELLED' || item.status==='COMPLETE')) : ( tabIndex === 1? props.data.filter(item=>item.status==='COMPLETE') : props.data.filter(item=>item.status==='CANCELLED') )}
                renderItem={renderData}

            />
        </View>

    );

};

const styles = StyleSheet.create({
    textStyle: {
        fontSize: 18,
    },
    fareStyle: {
        fontSize: 18,
    },
    scrollViewStyle: {
        width: '100%',
        height: 50,
        marginVertical: 10,
        backgroundColor: colors.BACKGROUND_PRIMARY,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    profStyle: {
        fontSize: 14,
        left: 10,
        fontWeight: 'bold',
        color: colors.BLACK,
        fontFamily: 'Roboto-Bold'
    },
    // carNoStyle: {
    //     marginLeft: 45,
    //     fontSize: 13,
    //     marginTop: 10
    // },
    picupStyle: {
        flexDirection: 'row',
    },
    picPlaceStyle: {
        color: colors.RIDELIST_TEXT
    },
    dropStyle: {
        flexDirection: 'row',
    },
    drpIconStyle: {
        color: colors.RED,
        fontSize: 20
    },
    dropPlaceStyle: {
        color: colors.RIDELIST_TEXT
    },
    greenDot: {
        alignSelf: 'center',
        borderRadius: 10,
        width: 10,
        height: 10,
        backgroundColor: colors.GREEN_DOT
    },
    redDot: {
        borderRadius: 10,
        width: 10,
        height: 10,
        backgroundColor: colors.RED

    },
    blackDot: {
        borderRadius: 10,
        width: 10,
        height: 10,
        backgroundColor: colors.BLACK

    },
    logoStyle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    iconClickStyle: {
        flex: 1,
    },
    flexViewStyle: {
        flex: 7,
        flexDirection: 'row',
        borderBottomColor: colors.RIDELIST_TEXT,
        borderBottomWidth: 1,
        marginTop: 10,
    },
    dateStyle: {
        fontFamily: 'Roboto-Bold',
        color: colors.HEADER
    },
    carNoStyle: {
        fontFamily: 'Roboto-Regular',
        fontSize: 14,
        marginTop: 8,
        color: colors.HEADER,
    },
    placeStyle: {
        fontFamily: 'Roboto-Regular',
        fontSize: 16,
        alignSelf: 'center'
    },
    textViewStyle: {
        marginTop: 10,
        marginBottom: 10
    },
    cancelImageStyle: {
        width: 50,
        height: 50,
        marginTop: 18,
    },
    iconViewStyle: {
        flex: 1, 
        marginTop: 10
    },
    textView1: {
        flex: 5
    },
    textView2: {
        flex: 2
    },
    textView3: {
        flex: 1
    },
    position: {
        marginTop: 20
    },
    textPosition: {
        alignSelf: 'center'
    },
    segmentcontrol: {
        color: colors.WHITE,
        fontSize: 18,
        fontFamily: "Roboto-Regular",
        marginTop: 0,
        alignSelf: "center",
        height: 50
    },
    accept: {
        fontFamily: 'Roboto-Regular',
        alignSelf: 'center',
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        padding: 7,
        textTransform:'uppercase',
        backgroundColor: colors.NEW,
        borderRadius:5
    },
});