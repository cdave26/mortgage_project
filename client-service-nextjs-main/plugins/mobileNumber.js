import {
  isPossiblePhoneNumber,
  isValidPhoneNumber,
  validatePhoneNumberLength,
  AsYouType,
} from "libphonenumber-js";
const regex = /^\+?\d*$/;

const validation = (name, errors = [], form, value, isValid) => {
  if (value && isValid) {
    const cleanNumber = value.replace(/\D/g, "");
    const checkIftheNumIsStartInOne = cleanNumber.toString();
    let areaCode, remainingDigits;

    if (checkIftheNumIsStartInOne.startsWith("1")) {
      areaCode = cleanNumber.slice(1, 4);
      remainingDigits = cleanNumber.slice(4);
    } else {
      areaCode = cleanNumber.slice(0, 3);
      remainingDigits = cleanNumber.slice(3);
    }
    value = `(${areaCode}) ${remainingDigits.slice(
      0,
      3
    )}-${remainingDigits.slice(3)}`;
  }

  setTimeout(() => {
    form.setFields([
      {
        name,
        value: value ? value : "", //make sure value is not null or undefined
        errors,
      },
    ]);
  }, 0);
};

export const validateMobileNumber = (
  value,
  form,
  name,
  submitButton = null
) => {
  if (typeof form !== "object") {
    throw new Error("form is not an object");
  }

  if (typeof name !== "string") {
    throw new Error("name is not a string");
  }

  if (name === "") {
    throw new Error("name is empty");
  }

  if (value === "") {
    validation(name, [`This field is required.`], form, value, false);
    return;
  }

  function disabledSubmitButton(isDisabled) {
    if (submitButton) {
      if (submitButton.current) {
        submitButton.current.disabled = isDisabled;
      }
    }
  }

  const asYouType = new AsYouType("US");
  let phoneNumber = asYouType.input(value);

  if (
    isValidPhoneNumber(phoneNumber, "US") &&
    !validatePhoneNumberLength(phoneNumber, "US") &&
    isPossiblePhoneNumber(phoneNumber, "US")
  ) {
    validation(name, [], form, phoneNumber, true);
    disabledSubmitButton(false);
  } else {
    validation(name, [`Invalid mobile number.`], form, value, false);
    disabledSubmitButton(true);
  }
};
