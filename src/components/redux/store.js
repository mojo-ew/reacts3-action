import { configureStore } from "@reduxjs/toolkit";
import AprovalAmountReducer from "./reducer/AprovalAmountReducer";
import HandleSideBarReducer from "./reducer/HandleSideBarReducer";
import TeamReducer from "./reducer/TeamReducer";
import UserReducer from "./reducer/UserReducer";
import TrainingDatasetReducer from "./reducer/TrainingDatasetReducer";

export default configureStore({
  reducer: {
    userDetails: UserReducer,
    teamDetails: TeamReducer,
    sideBarFlag: HandleSideBarReducer,
    aprovalAmount: AprovalAmountReducer,
    trainingArray: TrainingDatasetReducer,
  },
});
