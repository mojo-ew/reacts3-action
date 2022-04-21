import { targetDatasetArray } from "../initialStore";
import * as types from "../actionTypes";

export default function UserReducer(state = targetDatasetArray, action) {
  const { type, payload } = action;
  switch (type) {
    case types.TRANING_DATASET_VALUE:
      return [...payload];
    default:
      return state;
  }
}
