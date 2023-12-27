import { UI } from "./type";

/**
 * Trigger
 * @param {Boolean} spin
 * @returns {void}
 */
export const setSpinningAction = (spin) => {
  return (dispatch) => {
    dispatch({
      type: UI.isSpinning,
      payload: spin,
    });
  };
};

/**
 * Render UI
 * @param {Boolean} load
 */
export const setUIRenderAction = (load) => {
  return (dispatch) => {
    dispatch({
      type: UI.isRendered,
      payload: load,
    });
  };
};
/**
 * How to dispatch an action from a component: ui
 * 
   dispatch({
        type: 'UI/snackbars',
        payload: {
            open: true,
            message: 'Error',
            description: 'Network error',
            position: 'top-right',
            type: 'error',
        },
    });
    dispatch({
        type: 'UI/modal',
        payload: {
            open: true,
            title: 'Confirm',
            type: 'delete', //confirm
            icon: <ExclamationCircleFilled />,
            content: 'Some descriptions',
            onOk: () => {
                console.log('ok');
            },
            onCancel: () => {
                console.log('cancel');
            },
        },
    });
 */

/**
 * Back to previous step
 * @param {Number} num
 * @param {Object} props
 * @returns
 */

export const backForwardToPage = (num, props) => {
  if (typeof num !== "number" || num < 1) {
    throw new Error("Invalid number");
  }
  if (typeof props !== "object") {
    throw new Error("Invalid props");
  }

  return (dispatch) => {
    const onboarding = localStorage.getItem("onboarding");
    const nextRun = () => {
      localStorage.setItem(
        "onboarding",
        JSON.stringify([
          {
            id: props.onboarding.id,
            step: num,
          },
        ])
      );
    };
    if (onboarding) {
      const onboardingData = JSON.parse(onboarding);
      const index = onboardingData.findIndex(
        (data) => data.id === props.onboarding.id
      );
      if (index !== -1) {
        onboardingData[index].step = num;
        localStorage.setItem("onboarding", JSON.stringify(onboardingData));
      } else {
        nextRun();
      }
    } else {
      nextRun();
    }
    dispatch({
      type: "UI/stepper",
      payload: {
        loading: false,
        completeOnboarding: false,
        step: num,
      },
    });
  };
};

export const formChangeRemove = () => localStorage.removeItem("formChange");

export const getChangeForm = () => localStorage.getItem("formChange");

/**
 * Alert form dialog
 * @param {Boolean} isChange - true: change, false: not change
 * @param {Boolean} isModalOpen - true: open, false: close
 * @param {String} url - url to redirect
 * @returns  {void}
 */
export const formDialogAlert = (isChange, isModalOpen, url = "") => {
  if (typeof isChange !== "boolean") {
    throw new Error("Invalid isChange");
  }

  if (typeof isModalOpen !== "boolean") {
    throw new Error("Invalid isModalOpen");
  }

  if (url) {
    if (typeof url !== "string") {
      throw new Error("Invalid url");
    }
  }

  return (dispatch) => {
    dispatch({
      type: "UI/formChange",
      payload: {
        isChange,
        isModalOpen,
        url,
      },
    });
  };
};

export const draftsFrom = (key, name, value) => {
  if (key && name && value) {
    if (typeof key !== "string") {
      throw new Error("Invalid key");
    }

    if (typeof name !== "string") {
      throw new Error("Invalid name");
    }

    // if (typeof value !== "string" || typeof value !== "number") {
    //   throw new Error("Invalid value");
    // }

    const draft = localStorage.getItem("draft");
    if (draft) {
      const draftParse = JSON.parse(draft);
      const isExist = draftParse.find((item) => item.id === key);
      if (isExist) {
        const isExistData = isExist.data.find((item) => item.id === name);
        if (isExistData) {
          isExistData["value"] = value;
          localStorage.setItem("draft", JSON.stringify(draftParse));
        } else {
          isExist.data.push({
            id: name,
            name,
            value,
          });
          localStorage.setItem("draft", JSON.stringify(draftParse));
        }
      } else {
        localStorage.setItem(
          "draft",
          JSON.stringify([
            ...draftParse,
            {
              id: key,
              data: [
                {
                  id: name,
                  name,
                  value,
                },
              ],
              isDraftRetrieve: false,
            },
          ])
        );
      }
    } else {
      localStorage.setItem(
        "draft",
        JSON.stringify([
          {
            id: key,
            data: [
              {
                id: name,
                name,
                value,
              },
            ],
            isDraftRetrieve: false,
          },
        ])
      );
    }
  }
};

export const getDraftsFrom = (key) => {
  if (typeof key !== "string") {
    throw new Error("Invalid key");
  }
  const draft = localStorage.getItem("draft");
  if (draft) {
    const draftParse = JSON.parse(draft);
    const isExist = draftParse.filter((item) => item.id === key);
    if (isExist.length > 0) {
      return isExist;
    }
  }
  return [];
};

export const getDraftsFromByKey = (key, type) => {
  if (typeof key !== "string") {
    throw new Error("Invalid key");
  }
  const draft = localStorage.getItem("draft");
  if (draft) {
    const draftParse = JSON.parse(draft);
    const isExist = draftParse.find((item) => item.id === key);
    if (isExist) {
      isExist.isDraftRetrieve = type;
      localStorage.setItem("draft", JSON.stringify(draftParse));
    }
  }
  return [];
};

export const removeDraftsFrom = (key) => {
  if (typeof key !== "string") {
    throw new Error("Invalid key");
  }
  const draft = localStorage.getItem("draft");
  if (draft) {
    const draftParse = JSON.parse(draft);
    const isExist = draftParse.filter((item) => item.id !== key);
    if (isExist.length > 0) {
      localStorage.setItem("draft", JSON.stringify(isExist));
    } else {
      localStorage.removeItem("draft");
    }
  }
};
