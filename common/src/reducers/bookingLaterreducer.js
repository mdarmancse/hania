import {
  FETCH_BOOKINGS_LATER,
  FETCH_BOOKINGS_LATER_SUCCESS,
  FETCH_BOOKINGS_LATER_FAILED,
  UPDATE_BOOKING,
  CANCEL_BOOKING
} from "../store/types";

const INITIAL_STATE = {
  bookings: null,
  active: null,
  Count: null,
  tracked: null,
  loading: false,
  error: {
    flag: false,
    msg: null
  }
}

export const bookingLaterreducer = (state = INITIAL_STATE, action) => {
 // console.log("SD"+state)
 //console.log("Act"+action.type)

  switch (action.type) {
    case FETCH_BOOKINGS_LATER:
      return {
        ...state,
        loading: true
      };
    case FETCH_BOOKINGS_LATER_SUCCESS:
      return {
        ...state,
        ...action.payload,
        loading: false
      };
    case FETCH_BOOKINGS_LATER_FAILED:
      return {
        ...state,
        bookings: null,
        Count: null,
        active:null,
        tracked:null,
        loading: false,
        error: {
          flag: true,
          msg: action.payload
        }
      };
    case UPDATE_BOOKING:
      return {
        ...state
      }      
    case CANCEL_BOOKING:
      return {
        ...state
      };
    default:
      return state;
  }
};