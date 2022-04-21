import { userDetails } from '../initialStore';
import * as types from '../actionTypes';

export default function UserReducer(state = userDetails,action){
    const {type,payload} = action;
    switch(type){         
        case types.UPDATE_USER_PROFILE:
            return {...userDetails, profilePic: payload };   
        default:
            return state;
    }
}
