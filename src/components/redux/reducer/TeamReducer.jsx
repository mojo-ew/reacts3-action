import * as types from '../actionTypes';
import { teamDetails } from '../initialStore';

export default function TeamReducer(state = teamDetails,action){
    const {type,payload} = action;
    switch(type){         
        case types.UPDATE_COMPANY_LOGO :
            return {...teamDetails, companyLogo: payload};   
        default:
            return state;
    }
}
