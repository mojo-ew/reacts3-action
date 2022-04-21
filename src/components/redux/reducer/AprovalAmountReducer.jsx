import { aprovalAmount } from "../initialStore";
import * as types from "../actionTypes";

export default function AprovalAmountReducer(state = aprovalAmount, action) {
  const { type, payload } = action;
  switch (type) {
    case types.UPDATE_APROVAL_AMOUNT:
      const { amount } = state;
      return { ...aprovalAmount, amount: payload };
    default:
      return state;
  }
}
