import React, { useState } from "react";
import CustomDivider from "../base/CustomDivider";
import { Button, Form, Radio } from "antd";
import CustomFormItem from "../base/CustomFormItem";
import CustomInput from "../base/CustomInput";
import config from "~/config";
import CustomButton from "../base/CustomButton";
import Calculator from "~/plugins/calculator";
import {
  addCommas,
  removeCommas,
  checkNegative,
} from "~/plugins/formatNumbers";
import { monthsYears, onPercent, commaAndDecimal } from "~/lib/events";
import { LoadingOutlined } from "@ant-design/icons";
function AnnualPercentageRateCalculator() {
  const [form] = Form.useForm();

  const [loanType, setLoanType] = useState(null);

  const [closingCosts, setClosingCosts] = useState(null);

  const [validation, setValidation] = useState({
    loanamount: null,
    totalclosingcosts: null,
    loanoriginationfeetolender: null,
    loanoriginationfeetobroker: null,
    yearlyprivatemortgageinsurance: null,
    lendersinspectionfee: null,
    taxservicefee: null,
    underwritingreviewfee: null,
    applicationfee: null,
    brokerprocessingfee: null,
    otherexclappraisaltitleescrowattorney: null,
  });

  const [results, setResults] = useState({
    initialmonthlypayment: null,
    APR: null,
  });

  const [loading, setLoading] = useState(false);

  const calculate = (calc) => {
    setLoading(true);
    calc = commaAndDecimal(calc);
    const isValidForm = validateForm(calc);

    if (isValidForm) {
      setLoading(false);
      setResults({
        ...results,
        initialmonthlypayment: null,
        APR: null,
      });

      return;
    }
    const calculator = new Calculator(calc);
    const result = calculator.calculateAPR();
    result.APR = parseFloat(result.APR.toFixed(3));
    setResults(result);

    setTimeout(() => {
      setLoading(false);
    }, 10);
  };
  const onFormat = (event, name) => {
    setTimeout(() => {
      const val = form.getFieldValue(event.target.name);
      const rm = removeCommas(val);
      if (!isNaN(Number(rm))) {
        const result = addCommas(rm);
        setValidation({
          ...validation,
          [event.target.name]: val === "" ? null : result,
        });
        if (event.target.name === name) {
          if (val === "") {
            form.setFields([
              {
                name,
                errors: ["This field is required"],
              },
            ]);
          } else {
            validateForm({
              [event.target.name]: rm,
            });
          }
        }
      } else {
        form.setFieldsValue({
          [event.target.name]: validation[event.target.name],
        });
      }
    }, 0);
  };

  /**
   * Validate number
   * @param {Object} calc
   * @returns {Boolean} isValidForm
   */

  const validateForm = (calc) => {
    const result = {};
    for (const key in calc) {
      if (key === "loanamount") {
        if (parseFloat(calc[key]) < 1 || parseFloat(calc[key]) > 10000000) {
          form.setFields([
            {
              name: key,
              errors: ["Value must be between 1 and 10,000,000"],
            },
          ]);
          result[key] = true;
        }
      }

      if (key === "interestrate") {
        const isValid =
          parseFloat(calc[key]) >= 0.001 && parseFloat(calc[key]) <= 25;
        if (!isValid) {
          form.setFields([
            {
              name: key,
              errors: ["Value must be between 0.001 and 25"],
            },
          ]);

          result[key] = true;
        }
      }

      if (key === "loanterm") {
        if (Number(calc[key]) > 40 || Number(calc[key]) < 1) {
          form.setFields([
            {
              name: key,
              errors: ["Value must be between 1 and 40"],
            },
          ]);

          result[key] = true;
        }
      }

      if (key === "maxperiodicrateincrease") {
        const maxperiodicrateincrease =
          parseFloat(calc[key]) >= 0.001 && parseFloat(calc[key]) <= 10;

        if (!maxperiodicrateincrease) {
          form.setFields([
            {
              name: key,
              errors: ["Value must be between 0.001 and 10"],
            },
          ]);

          result[key] = true;
        }
      }

      if (key === "maxlifetimerateincrease") {
        const maxlifetimerateincrease =
          parseFloat(calc[key]) == 0 ||
          (parseFloat(calc[key]) >= 0.001 && parseFloat(calc[key]) <= 20);

        if (!maxlifetimerateincrease) {
          form.setFields([
            {
              name: key,
              errors: ["Value must be between 0 and 20"],
            },
          ]);

          result[key] = true;
        }
      }

      if (key === "presentratechangesafter") {
        const presentratechangesafter =
          parseFloat(calc[key]) >= 1 && parseFloat(calc[key]) <= 360;
        if (!presentratechangesafter) {
          form.setFields([
            {
              name: key,
              errors: ["Value must be between 1 and 360"],
            },
          ]);

          result[key] = true;
        }
      }

      if (key === "ratecanchangeevery") {
        const ratecanchangeevery =
          parseFloat(calc[key]) >= 1 && parseFloat(calc[key]) <= 360;
        if (!ratecanchangeevery) {
          form.setFields([
            {
              name: key,
              errors: ["Value must be between 1 and 360"],
            },
          ]);

          result[key] = true;
        }
      }

      if (key === "totalclosingcosts") {
        if (parseFloat(calc[key]) < 0 || parseFloat(calc[key]) > 100000) {
          form.setFields([
            {
              name: key,
              errors: ["Value must be between 0 and 100,000"],
            },
          ]);
          result[key] = true;
        }
      }

      if (key === "pointstolender") {
        if (brokerLenderHelper(calc[key], key)) {
          result[key] = true;
        }
      }

      if (key === "loanoriginationfeetolender") {
        if (enterClosingCostsIndividuallyHelper(calc[key], key)) {
          result[key] = true;
        }
      }

      if (key === "pointstobroker") {
        if (brokerLenderHelper(calc[key], key)) {
          result[key] = true;
        }
      }

      if (key === "loanoriginationfeetobroker") {
        if (enterClosingCostsIndividuallyHelper(calc[key], key)) {
          result[key] = true;
        }
      }

      if (key === "yearlyprivatemortgageinsurance") {
        if (enterClosingCostsIndividuallyHelper(calc[key], key)) {
          result[key] = true;
        }
      }

      if (key === "lendersinspectionfee") {
        if (enterClosingCostsIndividuallyHelper(calc[key], key)) {
          result[key] = true;
        }
      }

      if (key === "taxservicefee") {
        if (enterClosingCostsIndividuallyHelper(calc[key], key)) {
          result[key] = true;
        }
      }

      if (key === "underwritingreviewfee") {
        if (enterClosingCostsIndividuallyHelper(calc[key], key)) {
          result[key] = true;
        }
      }

      if (key === "applicationfee") {
        if (enterClosingCostsIndividuallyHelper(calc[key], key)) {
          result[key] = true;
        }
      }

      if (key === "brokerprocessingfee") {
        if (enterClosingCostsIndividuallyHelper(calc[key], key)) {
          result[key] = true;
        }
      }

      if (key === "otherexclappraisaltitleescrowattorney") {
        if (enterClosingCostsIndividuallyHelper(calc[key], key)) {
          result[key] = true;
        }
      }
    }

    for (let resultKey in result) {
      if (result[resultKey] === true) {
        return true;
      }
    }
    return false;
  };

  const brokerLenderHelper = (num, name) => {
    if (parseFloat(num) < 0 || parseFloat(num) > 5) {
      form.setFields([
        {
          name,
          errors: ["Value must be between 0 and 5"],
        },
      ]);
      return true;
    }
    return false;
  };
  const enterClosingCostsIndividuallyHelper = (num, name) => {
    if (parseFloat(num) < 0 || parseFloat(num) > 100000) {
      form.setFields([
        {
          name,
          errors: ["Value must be between 0 and 100,000"],
        },
      ]);
      return true;
    }
    return false;
  };
  return (
    <div className="print-section">
      <div className="flex justify-start items-start mb-3">
        <h2 className="text-denim my-0 font-sharp-sans-bold text-3xl text-center">
          Annual Percentage Rate (APR) Calculator
        </h2>
      </div>
      <CustomDivider />
      <div className="text-neutral-2 font-sharp-sans text-base">
        Calculate the Annual Percentage Rate (APR) of a loan.
      </div>
      <div className="flex flex-col lg:flex-row gap-20 mt-8 h-full pb-16">
        <div className="w-full lg:w-2/3">
          <div className="rounded-3xl border-solid  border border-alice-blue p-5">
            <Form form={form} onFinish={(submit) => calculate(submit)}>
              <CustomFormItem
                label="Loan Amount"
                name="loanamount"
                required
                rules={config.requiredRule}
              >
                <div className="loanamount">
                  <CustomInput
                    type="text"
                    placeholder="0.00"
                    onChange={(event) => onFormat(event, "loanamount")}
                    value={validation.loanamount || ""}
                    name="loanamount"
                  />
                  <div className="icon">
                    <img
                      src={`${window.location.origin}/icon/dolar.png`}
                      alt="percent"
                    />
                  </div>
                </div>
              </CustomFormItem>
              <CustomFormItem
                label="Interest Rate"
                name="interestrate"
                required
                rules={config.requiredRule}
              >
                <div className="percent">
                  <CustomInput
                    type="number"
                    placeholder="0"
                    onChange={(event) => onFormat(event, "interestrate")}
                    onKeyDown={(event) => onPercent(event, "interestrate")}
                    name="interestrate"
                  />
                  <div className="icon">
                    <img
                      src={`${window.location.origin}/icon/percent.png`}
                      alt="percent"
                    />
                  </div>
                </div>
              </CustomFormItem>
              <CustomFormItem
                label="Loan Term"
                name="loanterm"
                required
                rules={config.requiredRule}
              >
                <div className="monthYear">
                  <CustomInput
                    type="number"
                    onChange={(event) => onFormat(event, "loanterm")}
                    onKeyDown={(event) => monthsYears(event, "loanterm")}
                    name="loanterm"
                  />
                  <div className="icon">
                    <img
                      src={`${window.location.origin}/icon/years.png`}
                      alt="years"
                    />
                  </div>
                </div>
              </CustomFormItem>

              <CustomFormItem
                label="Loan Type"
                name="loantype"
                required
                rules={config.requiredRule}
              >
                {/* <div className="flex flex-col lg:flex-row gap-3">
                  <div className="input-radio flex justify-start justify-items-start items-center">
                    <input
                      type="radio"
                      id="fixed-rate"
                      name="loantype"
                      autoComplete="off"
                      // value='Fixed Rate'
                      onChange={(e) => {
                        if (e.target.checked) {
                          e.target.value = "Fixed Rate";
                          setLoanType(null);
                        } else {
                          e.target.value = "";
                        }
                      }}
                    />
                    <label
                      htmlFor="fixed-rate"
                      className="text-neutral-1 font-sharp-sans-medium text-xs ml-2"
                    >
                      Fixed rate
                    </label>
                  </div>

                  <div className="input-radio flex justify-start justify-items-start items-center">
                    <input
                      type="radio"
                      id="adjustable-rate"
                      name="loantype"
                      autoComplete="off"
                      // value='Adjustable Rate'
                      onChange={(e) => {
                        if (e.target.checked) {
                          e.target.value = "Adjustable Rate";
                          setLoanType("Adjustable Rate");
                        } else {
                          e.target.value = "";
                        }
                      }}
                    />
                    <label
                      htmlFor="adjustable-rate"
                      className="text-neutral-1 font-sharp-sans-medium text-xs ml-2"
                    >
                      Adjustable rate
                    </label>
                  </div>
                </div> */}

                <Radio.Group>
                  <Radio
                    value={"Fixed Rate"}
                    onChange={(event) => {
                      if (event.target.checked) {
                        setLoanType(null);
                      }
                    }}
                  >
                    {" "}
                    Fixed rate
                  </Radio>
                  <Radio
                    value={"adjustable-rate"}
                    onChange={(event) => {
                      if (event.target.checked) {
                        setLoanType("Adjustable Rate");
                      }
                    }}
                  >
                    {" "}
                    Adjustable rate
                  </Radio>
                </Radio.Group>
              </CustomFormItem>

              {loanType ? (
                loanType === "Adjustable Rate" ? (
                  <>
                    <CustomFormItem
                      label="Max. Periodic Rate Increase"
                      name="maxperiodicrateincrease"
                      required
                      rules={config.requiredRule}
                    >
                      <div className="percent">
                        <CustomInput
                          type="number"
                          placeholder="0"
                          onChange={(event) =>
                            onFormat(event, "maxperiodicrateincrease")
                          }
                          onKeyDown={(event) =>
                            onPercent(event, "maxperiodicrateincrease")
                          }
                          name="maxperiodicrateincrease"
                        />
                        <div className="icon">
                          <img
                            src={`${window.location.origin}/icon/percent.png`}
                            alt="percent"
                          />
                        </div>
                      </div>
                    </CustomFormItem>

                    <CustomFormItem
                      label="Max. Lifetime Rate Increase"
                      name="maxlifetimerateincrease"
                      required
                      rules={config.requiredRule}
                    >
                      <div className="percent">
                        <CustomInput
                          type="number"
                          placeholder="0"
                          onChange={(event) =>
                            onFormat(event, "maxlifetimerateincrease")
                          }
                          onKeyDown={(event) =>
                            onPercent(event, "maxlifetimerateincrease")
                          }
                          name="maxlifetimerateincrease"
                        />
                        <div className="icon">
                          <img
                            src={`${window.location.origin}/icon/percent.png`}
                            alt="percent"
                          />
                        </div>
                      </div>
                    </CustomFormItem>

                    <CustomFormItem
                      label="Present Rate Changes After"
                      name="presentratechangesafter"
                      required
                      rules={config.requiredRule}
                    >
                      <div className="monthYear">
                        <CustomInput
                          type="number"
                          onChange={(event) =>
                            onFormat(event, "presentratechangesafter")
                          }
                          onKeyDown={(event) =>
                            monthsYears(
                              event,
                              "presentratechangesafter",
                              "isMoth"
                            )
                          }
                          name="presentratechangesafter"
                        />
                        <div className="icon">
                          <img
                            src={`${window.location.origin}/icon/months.png`}
                            alt="Months"
                          />
                        </div>
                      </div>
                    </CustomFormItem>

                    <CustomFormItem
                      label="Rate can Change Every"
                      name="ratecanchangeevery"
                      required
                      rules={config.requiredRule}
                    >
                      <div className="monthYear">
                        <CustomInput
                          type="number"
                          onChange={(event) =>
                            onFormat(event, "ratecanchangeevery")
                          }
                          onKeyDown={(event) =>
                            monthsYears(event, "ratecanchangeevery", "isMoth")
                          }
                          name="ratecanchangeevery"
                        />
                        <div className="icon">
                          <img
                            src={`${window.location.origin}/icon/months.png`}
                            alt="Months"
                          />
                        </div>
                      </div>
                    </CustomFormItem>
                  </>
                ) : null
              ) : null}

              <CustomFormItem
                label="Closing Costs"
                name="closingcosts"
                required
                rules={config.requiredRule}
              >
                {/* <div className="flex flex-col justify-start items-center gap-3 w-full">
                  <div className="input-radio flex justify-start justify-items-start items-center w-full">
                    <input
                      type="radio"
                      id="enter-total-closing-costs"
                      name="closingcosts"
                      autoComplete="off"
                      onChange={(e) => {
                        if (e.target.checked) {
                          e.target.value = "ENTER TOTAL CLOSING COSTS";
                          setClosingCosts(null);
                        } else {
                          e.target.value = "";
                        }
                      }}
                    />
                    <label
                      htmlFor="enter-total-closing-costs"
                      className="text-neutral-1 font-sharp-sans-medium text-xs ml-2"
                    >
                      Enter Total Closing Costs
                    </label>
                  </div>

                  <div className="input-radio flex justify-start justify-items-start items-center w-full">
                    <input
                      type="radio"
                      id="enter-closing-costs-individually"
                      name="closingcosts"
                      autoComplete="off"
                      onChange={(e) => {
                        if (e.target.checked) {
                          e.target.value = "ENTER CLOSING COSTS INDIVIDUALLY";
                          setClosingCosts("ENTER CLOSING COSTS INDIVIDUALLY");
                        } else {
                          e.target.value = "";
                        }
                      }}
                    />
                    <label
                      htmlFor="enter-closing-costs-individually"
                      className="text-neutral-1 font-sharp-sans-medium text-xs ml-2"
                    >
                      Enter Closing Costs Individually
                    </label>
                  </div>
                </div> */}

                <Radio.Group>
                  <Radio
                    value={"ENTER TOTAL CLOSING COSTS"}
                    onChange={(event) => {
                      if (event.target.checked) {
                        setClosingCosts(null);
                      }
                    }}
                  >
                    Enter Total Closing Costs
                  </Radio>
                  <Radio
                    value={"ENTER CLOSING COSTS INDIVIDUALLY"}
                    onChange={(event) => {
                      if (event.target.checked) {
                        setClosingCosts("ENTER CLOSING COSTS INDIVIDUALLY");
                      }
                    }}
                  >
                    {" "}
                    Enter Closing Costs Individually
                  </Radio>
                </Radio.Group>
              </CustomFormItem>

              {closingCosts ? (
                <>
                  <CustomFormItem
                    label="Points To Lender"
                    name="pointstolender"
                    required
                    rules={config.requiredRule}
                  >
                    <div className="percent">
                      <CustomInput
                        type="number"
                        placeholder="0"
                        onChange={(event) => onFormat(event, "pointstolender")}
                        onKeyDown={(event) =>
                          onPercent(event, "pointstolender")
                        }
                        name="pointstolender"
                      />
                      <div className="icon">
                        <img
                          src={`${window.location.origin}/icon/percent.png`}
                          alt="percent"
                        />
                      </div>
                    </div>
                  </CustomFormItem>

                  <CustomFormItem
                    label="Loan Origination Fee To Lender"
                    name="loanoriginationfeetolender"
                    required
                    rules={config.requiredRule}
                  >
                    <div className="loanamount">
                      <CustomInput
                        type="text"
                        placeholder="0.00"
                        onChange={(event) =>
                          onFormat(event, "loanoriginationfeetolender")
                        }
                        value={validation.loanoriginationfeetolender || ""}
                        name="loanoriginationfeetolender"
                      />
                      <div className="icon">
                        <img
                          src={`${window.location.origin}/icon/dolar.png`}
                          alt="percent"
                        />
                      </div>
                    </div>
                  </CustomFormItem>

                  <CustomFormItem
                    label="Points To Broker"
                    name="pointstobroker"
                    required
                    rules={config.requiredRule}
                  >
                    <div className="percent">
                      <CustomInput
                        type="number"
                        placeholder="0"
                        onChange={(event) => onFormat(event, "pointstobroker")}
                        onKeyDown={(event) =>
                          onPercent(event, "pointstobroker")
                        }
                        name="pointstobroker"
                      />
                      <div className="icon">
                        <img
                          src={`${window.location.origin}/icon/percent.png`}
                          alt="percent"
                        />
                      </div>
                    </div>
                  </CustomFormItem>

                  <CustomFormItem
                    label="Loan Origination Fee To Broker"
                    name="loanoriginationfeetobroker"
                    required
                    rules={config.requiredRule}
                  >
                    <div className="loanamount">
                      <CustomInput
                        type="text"
                        placeholder="0.00"
                        onChange={(event) =>
                          onFormat(event, "loanoriginationfeetobroker")
                        }
                        value={validation.loanoriginationfeetobroker || ""}
                        name="loanoriginationfeetobroker"
                      />
                      <div className="icon">
                        <img
                          src={`${window.location.origin}/icon/dolar.png`}
                          alt="percent"
                        />
                      </div>
                    </div>
                  </CustomFormItem>

                  <CustomFormItem
                    label="Yearly Private Mortgage Insurance"
                    name="yearlyprivatemortgageinsurance"
                    required
                    rules={config.requiredRule}
                  >
                    <div className="loanamount">
                      <CustomInput
                        type="text"
                        placeholder="0.00"
                        onChange={(event) =>
                          onFormat(event, "yearlyprivatemortgageinsurance")
                        }
                        value={validation.yearlyprivatemortgageinsurance || ""}
                        name="yearlyprivatemortgageinsurance"
                      />
                      <div className="icon">
                        <img
                          src={`${window.location.origin}/icon/dolar.png`}
                          alt="percent"
                        />
                      </div>
                    </div>
                  </CustomFormItem>

                  <CustomFormItem
                    label={`Lender's Inspection Fee`}
                    name="lendersinspectionfee"
                    required
                    rules={config.requiredRule}
                  >
                    <div className="loanamount">
                      <CustomInput
                        type="text"
                        placeholder="0.00"
                        onChange={(event) =>
                          onFormat(event, "lendersinspectionfee")
                        }
                        value={validation.lendersinspectionfee || ""}
                        name="lendersinspectionfee"
                      />
                      <div className="icon">
                        <img
                          src={`${window.location.origin}/icon/dolar.png`}
                          alt="percent"
                        />
                      </div>
                    </div>
                  </CustomFormItem>

                  <CustomFormItem
                    label="Tax Service Fee"
                    name="taxservicefee"
                    required
                    rules={config.requiredRule}
                  >
                    <div className="loanamount">
                      <CustomInput
                        type="text"
                        placeholder="0.00"
                        onChange={(event) => onFormat(event, "taxservicefee")}
                        value={validation.taxservicefee || ""}
                        name="taxservicefee"
                      />
                      <div className="icon">
                        <img
                          src={`${window.location.origin}/icon/dolar.png`}
                          alt="percent"
                        />
                      </div>
                    </div>
                  </CustomFormItem>

                  <CustomFormItem
                    label="Underwriting Review Fee"
                    name="underwritingreviewfee"
                    required
                    rules={config.requiredRule}
                  >
                    <div className="loanamount">
                      <CustomInput
                        type="text"
                        placeholder="0.00"
                        onChange={(event) =>
                          onFormat(event, "underwritingreviewfee")
                        }
                        value={validation.underwritingreviewfee || ""}
                        name="underwritingreviewfee"
                      />
                      <div className="icon">
                        <img
                          src={`${window.location.origin}/icon/dolar.png`}
                          alt="percent"
                        />
                      </div>
                    </div>
                  </CustomFormItem>

                  <CustomFormItem
                    label="Application Fee"
                    name="applicationfee"
                    required
                    rules={config.requiredRule}
                  >
                    <div className="loanamount">
                      <CustomInput
                        type="text"
                        placeholder="0.00"
                        onChange={(event) => onFormat(event, "applicationfee")}
                        value={validation.applicationfee || ""}
                        name="applicationfee"
                      />
                      <div className="icon">
                        <img
                          src={`${window.location.origin}/icon/dolar.png`}
                          alt="percent"
                        />
                      </div>
                    </div>
                  </CustomFormItem>
                  <CustomFormItem
                    label="Broker Processing Fee"
                    name="brokerprocessingfee"
                    required
                    rules={config.requiredRule}
                  >
                    <div className="loanamount">
                      <CustomInput
                        type="text"
                        placeholder="0.00"
                        onChange={(event) =>
                          onFormat(event, "brokerprocessingfee")
                        }
                        value={validation.brokerprocessingfee || ""}
                        name="brokerprocessingfee"
                      />
                      <div className="icon">
                        <img
                          src={`${window.location.origin}/icon/dolar.png`}
                          alt="percent"
                        />
                      </div>
                    </div>
                  </CustomFormItem>

                  <CustomFormItem
                    label="Other (EXCL Appraisal/Title/Escrow/Attorney)"
                    name="otherexclappraisaltitleescrowattorney"
                    required
                    rules={config.requiredRule}
                  >
                    <div className="loanamount">
                      <CustomInput
                        type="text"
                        placeholder="0.00"
                        onChange={(event) =>
                          onFormat(
                            event,
                            "otherexclappraisaltitleescrowattorney"
                          )
                        }
                        value={
                          validation.otherexclappraisaltitleescrowattorney || ""
                        }
                        name="otherexclappraisaltitleescrowattorney"
                      />
                      <div className="icon">
                        <img
                          src={`${window.location.origin}/icon/dolar.png`}
                          alt="percent"
                        />
                      </div>
                    </div>
                  </CustomFormItem>
                </>
              ) : null}

              {!closingCosts ? (
                <CustomFormItem
                  label="Total Closing Costs"
                  name="totalclosingcosts"
                  required
                  rules={config.requiredRule}
                >
                  <div className="loanamount">
                    <CustomInput
                      type="text"
                      placeholder="0.00"
                      onChange={(event) => onFormat(event, "totalclosingcosts")}
                      value={validation.totalclosingcosts || ""}
                      name="totalclosingcosts"
                    />
                    <div className="icon">
                      <img
                        src={`${window.location.origin}/icon/dolar.png`}
                        alt="percent"
                      />
                    </div>
                  </div>
                </CustomFormItem>
              ) : null}
              <CustomButton
                htmlType="submit"
                label={loading ? <LoadingOutlined /> : "Calculate"}
                isfullwidth={true}
              />
            </Form>
            <div className="text-neutral-3 font-sharp-sans text-xs mt-5">
              Default amounts are hypothetical and may not apply to your
              individual situation. This calculator provides approximations for
              informational purposes only. Actual results will be provided by
              your lender and will likely vary depending on your eligibility and
              current market rates.
            </div>
          </div>
        </div>
        <div className="w-full">
          <div className="flex justify-between items-center w-full">
            <h2 className="text-denim my-0 font-sharp-sans-bold text-3xl text-center">
              Results
            </h2>
            <Button
              className="border-solid rounded-lg border-2 border-xanth flex gap-3 justify-center justify-items-center items-center h-10"
              onClick={() => {
                window.print();
              }}
              id="print-button"
            >
              <img
                src={`${window.location.origin}/icon/printIcon.png`}
                alt="print-icon"
              />
              <span className="text-neutral-2 font-sharp-sans-semi-bold">
                Print
              </span>
            </Button>
          </div>
          <hr className="block h-1 border-0 border-t border-solid border-alice-blue my-5 p-0 w-full" />

          <div className="flex flex-col justify-evenly items-end gap-3 w-full">
            <div className="text-neutral-1 font-sharp-sans text-sm">
              Initial Monthly Payment
            </div>
            <div className="text-denim my-0 font-sharp-sans-bold text-3xl text-center mt-1">
              {results.initialmonthlypayment
                ? checkNegative(results.initialmonthlypayment)
                : "$0.00"}
            </div>
          </div>
          <div className="flex flex-col justify-evenly items-end gap-3 w-full mt-5">
            <div className="text-neutral-1 font-sharp-sans text-sm">APR</div>
            <div className="text-denim my-0 font-sharp-sans-bold text-3xl text-center mt-1">
              {results.APR ? `${results.APR}%` : "0%"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnnualPercentageRateCalculator;
