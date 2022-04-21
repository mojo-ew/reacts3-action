import { sideBarFlag } from "../initialStore";
import * as types from "../actionTypes";

export default function HandleSideBarReducer(state = sideBarFlag, action) {
  const { type } = action;
  switch (type) {
    case types.UPDATE_SIDEBAR_FLAG:
      const { flag } = state;
      return { flag: !flag };
    default:
      return state;
  }
}
