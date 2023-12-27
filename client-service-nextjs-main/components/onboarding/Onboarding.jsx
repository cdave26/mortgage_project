import React, { useState, useRef, useEffect } from "react";
import AddUserComponent from "../AddUser/AddUserComponent";
import CustomDivider from "../base/CustomDivider";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import AddUpdateCompany from "../AddUpdateCompany/AddUpdateCompany";
import {
  getCompanyAction,
  getCompanyListByIdAction,
} from "~/store/company/action";
import {
  getStatesAction,
  getStatesPerCompanyAction,
} from "~/store/state/action";
import { getPricingEngineAction } from "~/store/pricingEngine/action";
import AddLicenseComponent from "../state-license/AddLicenseComponent";
import { getLicenseListAction } from "~/store/licenses/action";
import StrategiesComponent from "../optimal-blue/StrategiesComponent";
import {
  getCompanyStrategyAction,
  getDefaultStrategyPerCompanyAction,
  selectMassUsersAction,
  showMassUpdateModalAction,
} from "~/store/pricingEngine/optimalBlue/action";
import { getUserTypesAction } from "~/store/auth/action";
import ErrorPage from "../404/404Components";
import { getUserAction, isEditUserAction } from "~/store/users/action";
import { LoadingOutlined } from "@ant-design/icons";
import { defaultPagination } from "~/utils/constants";

const OnboardingComponent = ({ user }) => {
  const dispatch = useDispatch();

  const {
    stepper: { loading, step: steppers },
  } = useSelector((state) => {
    return {
      stepper: state.ui.stepper,
    };
  }, shallowEqual);

  useEffect(() => {
    const onboarding = localStorage.getItem("onboarding");
    const createUserOnboarding = () => {
      localStorage.setItem(
        "onboarding",
        JSON.stringify([
          {
            id: user.id,
            stepper: 1,
          },
        ])
      );
    };
    if (onboarding) {
      const onboardingUser = JSON.parse(onboarding);
      const userIndex = onboardingUser.findIndex((item) => item.id === user.id);
      if (userIndex !== -1) {
        if (loading) {
          dispatch({
            type: "UI/stepper",
            payload: {
              loading: false,
              completeOnboarding: false,
              step: onboardingUser[userIndex].step,
            },
          });
        }
      } else {
        createUserOnboarding();
      }
    } else {
      dispatch({
        type: "UI/stepper",
        payload: {
          loading: false,
          completeOnboarding: false,
          step: 1,
        },
      });

      createUserOnboarding();
    }
  }, [loading]);

  useEffect(() => {
    const addLicense = () => {
      dispatch(getStatesPerCompanyAction(user.company.id));
      dispatch(
        getLicenseListAction({
          page: 1,
          limit: defaultPagination.pageSize,
          search: "",
          stateId: "",
          sortBy: "updated_at",
          order: "desc",
        })
      );
    };

    if (steppers === 1) {
      if (Number(user.user_type_id) === 2 || Number(user.user_type_id) === 3) {
        dispatch(getPricingEngineAction());
        dispatch(getUserTypesAction());
        dispatch(getCompanyListByIdAction());
        dispatch(isEditUserAction(true));
        dispatch(getUserAction(user.id));
      }
    }

    if (steppers === 2) {
      if (Number(user.user_type_id) === 2) {
        setTimeout(() => {
          dispatch(getCompanyAction(user.company.id, true));
          dispatch(getStatesAction());
          dispatch(getPricingEngineAction());
        }, 1000);
      } else if (Number(user.user_type_id) === 3) {
        addLicense();
      }
    }
    if (steppers === 3) {
      if (Number(user.user_type_id) === 2) {
        addLicense();
      }
    }

    if (steppers === 4) {
      if (Number(user.user_type_id) === 2) {
        dispatch(showMassUpdateModalAction(false));
        dispatch(selectMassUsersAction([]));
        dispatch(getUserTypesAction());
        dispatch(getDefaultStrategyPerCompanyAction());
        dispatch(getCompanyStrategyAction());
      }
    }
  }, [steppers]);

  const loadingComp = () => {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingOutlined />
      </div>
    );
  };

  const onboardingStepper = (num, waitingToDispatch) => {
    switch (num) {
      case 1:
        return (
          <>
            {headingUser()}
            <div className="text-center font-sharp-sans text-neutral-2">
              Please enter your personal information to start.
            </div>
            {waitingToDispatch ? (
              loadingComp()
            ) : (
              <AddUserComponent onboarding={user} />
            )}
          </>
        );
      case 2:
        if (Number(user.user_type_id) === 2) {
          return (
            <>
              {headingUser()}
              <div className="text-center font-sharp-sans text-neutral-2">
                Please add your company details here.
              </div>
              {waitingToDispatch ? (
                loadingComp()
              ) : (
                <AddUpdateCompany onboarding={user} />
              )}
            </>
          );
        } else if (Number(user.user_type_id) === 3) {
          return (
            <>
              {headingUser()}
              <div className="text-center font-sharp-sans text-neutral-2">
                Please enter your personal information to start.
              </div>

              {waitingToDispatch ? (
                loadingComp()
              ) : (
                <AddLicenseComponent onboarding={user} />
              )}
            </>
          );
        }

      case 3:
        if (Number(user.user_type_id) === 2) {
          return (
            <>
              {headingUser()}
              <div className="text-center font-sharp-sans text-neutral-2">
                Please enter your personal information to start.
              </div>
              {waitingToDispatch ? (
                loadingComp()
              ) : (
                <AddLicenseComponent onboarding={user} />
              )}
            </>
          );
        } else {
          return <ErrorPage />;
        }

      case 4:
        if (Number(user.user_type_id) === 2) {
          return (
            <>
              {headingUser()}
              <div className="text-center font-sharp-sans text-neutral-2">
                Please enter your personal information to start.
              </div>
              <StrategiesComponent onboarding={user} />
            </>
          );
        } else {
          return <ErrorPage />;
        }
      default:
        return <ErrorPage />;
    }
  };

  const headingUser = () => {
    return (
      <div className="flex flex-col justify-center content-start items-center  w-full">
        <h2 className="text-4xl text-denim font-sharp-sans-bold mt-0 mb-3">
          Welcome, {user.first_name} {user.last_name}!
        </h2>
        <CustomDivider />
      </div>
    );
  };

  return <>{onboardingStepper(steppers, loading)}</>;
};

export default OnboardingComponent;
