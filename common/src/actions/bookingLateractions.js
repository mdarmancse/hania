import {
  FETCH_BOOKINGS_LATER,
  FETCH_BOOKINGS_SUCCESS,
  FETCH_BOOKINGS_FAILED,
  UPDATE_BOOKING,
  CANCEL_BOOKING
} from "../store/types";
import { fetchBookingLocations } from '../actions/locationactions';
import { RequestPushMsg } from '../other/NotificationFunctions';
import { FareCalculator } from '../other/FareCalculator';
import { GetDistance, GetTripDistance } from '../other/GeoFunctions';
import { fetchAddressfromCoords } from '../other/GoogleAPIFunctions'; 
import store from '../store/store';

export const fetchBookingsLater = (uid, role) => (dispatch) => (firebase) => {

  const {
    bookingLaterRef,
  } = firebase;

  dispatch({
    type: FETCH_BOOKINGS_LATER,
    payload: null,
  });
  bookingLaterRef(uid, role).on("value", (snapshot) => {

    if (snapshot.val()) {
      const data = snapshot.val();


      const active = [];
      let tracked = null;
      const bookings = Object.keys(data)
        .map((i) => {
          data[i].id = i;
          data[i].pickupAddress = data[i].pickup.add;
          data[i].dropAddress = data[i].drop.add;
          data[i].discount = data[i].discount_amount
            ? data[i].discount_amount
            : 0;
          data[i].cashPaymentAmount = data[i].cashPaymentAmount
            ? data[i].cashPaymentAmount
            : 0;
          data[i].cardPaymentAmount = data[i].cardPaymentAmount
            ? data[i].cardPaymentAmount
            : 0;
          return data[i];
        });


      for (let i = 0; i < bookings.length; i++) {
        if (['PENDING'].indexOf(bookings[i].status) != -1) {
          active.push(bookings[i]);
        }
        if ((['PENDING'].indexOf(bookings[i].status) != -1) && role == 'driver') {
          tracked = bookings[i];
          fetchBookingLocations(tracked.id)(dispatch)(firebase);
        }
      }
      dispatch({
        type: FETCH_BOOKINGS_SUCCESS,
        payload: {
          bookings: bookings.reverse(),
          active: active,
          tracked: tracked
        },
      });
      if (tracked) {
        dispatch({
          type: FETCH_BOOKINGS_SUCCESS,
          payload: null
        });
      }
    } else {
      dispatch({
        type: FETCH_BOOKINGS_FAILED,
        payload: store.getState().languagedata.defaultLanguage.no_bookings,
      });
    }
  });
};

