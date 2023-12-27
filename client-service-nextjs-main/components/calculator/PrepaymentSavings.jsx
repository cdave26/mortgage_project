import React, { useState } from "react";
import CustomDivider from "../base/CustomDivider";
import { Button, Form, Radio } from "antd";
import CustomFormItem from "../base/CustomFormItem";
import CustomInput from "../base/CustomInput";
import config from "~/config";
import CustomButton from "../base/CustomButton";
import Calculator from "~/plugins/calculator";
import Table from "../Table/Table";
import { useDispatch } from "react-redux";
import {
  addCommas,
  removeCommas,
  checkNegative,
} from "~/plugins/formatNumbers";
import { monthsYears, onPercent, commaAndDecimal } from "~/lib/events";
import { LoadingOutlined } from "@ant-design/icons";
import CustomSelect from "../base/CustomSelect";
const monthly = [
  {
    label: "No",
    value: "No",
  },
  {
    label: "Monthly",
    value: "Monthly",
  },
  {
    label: "Yearly",
    value: "Yearly",
  },
];
const additionalPaymentFrequency = [
  {
    label: "Monthly",
    value: "Monthly",
  },
  {
    label: "Yearly",
    value: "Yearly",
  },
];

const mekeFirstAdditionalPayment = [
  {
    label: "Starting Next Month",
    value: "Starting Next Month",
  },
  {
    label: "One Year From Now",
    value: "One Year From Now",
  },
  {
    label: "Starting Next Year",
    value: "Starting Next Year",
  },
];

function PrepaymentSavings() {
  const columns = [
    {
      title: "Time Period",
      dataIndex: "timePeriod",
      key: "timePeriod",
    },

    {
      title: "Payment",
      dataIndex: "payment",
      key: "payment",
    },
    {
      title: "Extra Payment	",
      dataIndex: "extraPayment",
      key: "extraPayment",
    },
    {
      title: "Principal",
      dataIndex: "principal",
      key: "principal",
    },

    {
      title: "Interest",
      dataIndex: "interest",
      key: "interest",
    },
    {
      title: "Balance",
      dataIndex: "balance",
      key: "balance",
      fixed: "right",
    },
  ];

  const dispatch = useDispatch();

  const [form] = Form.useForm();

  const [results, setResults] = useState({});

  const [selectedAmortization, setSelectedAmortization] = useState(null);

  const [loanType, setLoanType] = useState(null);

  const [validation, setValidation] = useState({
    additionalpaymentamount: null,
    presentloanbalance: null,
  });

  const [loading, setLoading] = useState(false);

  const calculate = (calc) => {
    setLoading(true);

    calc = {
      ...calc,
      amortizationTableInterval: calc.amortizationTableInterval.value,
      makefirstadditionalpayment: calc.makefirstadditionalpayment.value,
      additionalPaymentAmountFrequency:
        calc.additionalPaymentAmountFrequency.value,
    };

    calc = commaAndDecimal(calc);
    const isValidForm = validateForm(calc);

    if (isValidForm) {
      setLoading(false);
      setResults({});
      return;
    }
    const calculator = new Calculator(calc);
    const result = calculator.calculatePrepaymentSavings();
    if (Object.keys(result).length > 0) {
      setResults(result);
      setTimeout(() => {
        setLoading(false);
      }, 10);
    }
  };

  const manipulateTheData = (data) => {
    const { rows, totals } = data;
    if (selectedAmortization === "Monthly") {
      rows.push(totals);
    }
    return rows;
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
      if (key === "additionalpaymentamount") {
        if (parseFloat(calc[key]) < 1 || parseFloat(calc[key]) > 100000) {
          form.setFields([
            {
              name: key,
              errors: ["Value must be between 1 and 100,000"],
            },
          ]);
          result[key] = true;
        }
      }

      if (key === "presentloanbalance") {
        if (parseFloat(calc[key]) > 10000000 || parseFloat(calc[key]) < 1) {
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

      if (key === "remainingloantermyear") {
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

      if (key === "remainingloantermmonth") {
        const remainingloantermmonth =
          Number(calc[key]) == 0 || parseFloat(calc[key]) <= 11;
        if (!remainingloantermmonth) {
          form.setFields([
            {
              name: key,
              errors: ["Value must be between 0 and 11"],
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
    }

    for (let resultKey in result) {
      if (result[resultKey] === true) {
        return true;
      }
    }
    return false;
  };

  return (
    <div className="print-section ">
      <div className="flex justify-start items-start mb-3">
        <h2 className="text-denim my-0 font-sharp-sans-bold text-3xl text-center">
          Prepayment Savings Calculator
        </h2>
      </div>
      <CustomDivider />
      <div className="text-neutral-2 font-sharp-sans text-base">
        Calculate your interest savings and loan term reduction by making
        additional mortgage payments.
      </div>
      <div className="flex flex-col lg:flex-row gap-20 mt-8 h-full pb-16">
        <div className="w-full lg:w-1/3">
          <div className="rounded-3xl border-solid  border border-alice-blue p-5">
            <Form form={form} onFinish={(submit) => calculate(submit)}>
              <CustomFormItem
                label="Additional Payment Amount"
                name="additionalpaymentamount"
                required
                rules={config.requiredRule}
              >
                <div className="loanamount">
                  <CustomInput
                    type="text"
                    placeholder="0.00"
                    onChange={(event) =>
                      onFormat(event, "additionalpaymentamount")
                    }
                    value={validation.additionalpaymentamount || ""}
                    name="additionalpaymentamount"
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
                label="Additional Payment Frequency"
                name="additionalPaymentAmountFrequency" //monthlyRate
                required
                rules={config.requiredRule.slice(0, 1)}
              >
                <CustomSelect
                  placeholder="Select"
                  options={additionalPaymentFrequency}
                />
              </CustomFormItem>
              <CustomFormItem
                label="Make First Additional Payment"
                name="makefirstadditionalpayment" //monthlyRate
                required
                rules={config.requiredRule.slice(0, 1)}
              >
                <CustomSelect
                  placeholder="Select"
                  options={mekeFirstAdditionalPayment}
                />
              </CustomFormItem>

              <CustomFormItem
                label="Present Loan Balance"
                name="presentloanbalance"
                required
                rules={config.requiredRule}
              >
                <div className="loanamount">
                  <CustomInput
                    type="text"
                    placeholder="0.00"
                    onChange={(event) => onFormat(event, "presentloanbalance")}
                    value={validation.presentloanbalance || ""}
                    name="presentloanbalance"
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
              <div>
                <p className="text-neutral-2 font-sharp-sans-semibold mb-1 mt-0 text-xs">
                  Remaining Loan Term <span className="text-error">*</span>
                </p>

                <div className="flex flex-col lg:flex-row gap-3">
                  <div className="flex-1">
                    <CustomFormItem
                      name="remainingloantermyear"
                      rules={config.requiredRule}
                    >
                      <div className="monthYear">
                        <CustomInput
                          type="number"
                          onChange={(event) =>
                            onFormat(event, "remainingloantermyear")
                          }
                          onKeyDown={(event) =>
                            monthsYears(event, "remainingloantermyear")
                          }
                          name="remainingloantermyear"
                        />
                        <div className="icon">
                          <img
                            src={`${window.location.origin}/icon/years.png`}
                            alt="years"
                          />
                        </div>
                      </div>
                    </CustomFormItem>
                  </div>

                  <div className="flex-1">
                    <CustomFormItem
                      name="remainingloantermmonth"
                      rules={config.requiredRule}
                    >
                      <div className="monthYear">
                        <CustomInput
                          type="number"
                          onChange={(event) =>
                            onFormat(event, "remainingloantermmonth")
                          }
                          onKeyDown={(event) =>
                            monthsYears(
                              event,
                              "remainingloantermmonth",
                              "isMoth"
                            )
                          }
                          name="remainingloantermmonth"
                        />
                        <div className="icon">
                          <img
                            src={`${window.location.origin}/icon/months.png`}
                            alt="Months"
                          />
                        </div>
                      </div>
                    </CustomFormItem>
                  </div>
                </div>
              </div>

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
                label="Show Amortization Table"
                name="amortizationTableInterval" //monthlyRate
                required
                rules={config.requiredRule.slice(0, 1)}
              >
                <CustomSelect
                  placeholder="Select"
                  options={monthly}
                  onChange={(opt) => setSelectedAmortization(opt?.value)}
                />
              </CustomFormItem>

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

          {Object.keys(results).length > 0 ? (
            <>
              <div className="flex flex-col justify-evenly items-end gap-3 w-full">
                <div className="text-neutral-1 font-sharp-sans text-sm">
                  Loan Term Reduction
                </div>
                <h2 className="text-denim my-0 font-sharp-sans-bold text-3xl text-center mt-3">
                  {results.loantermreduction}
                </h2>
              </div>
              <hr className="block h-1 border-0 border-t border-solid border-alice-blue my-5 p-0 w-full" />
              <div className="flex flex-col justify-evenly items-end gap-3 w-full">
                <div className="text-neutral-1 font-sharp-sans text-sm">
                  Interest Savings
                </div>
                <h2 className="text-denim my-0 font-sharp-sans-bold text-3xl text-center mt-3">
                  {checkNegative(results.interestsavings)}
                </h2>
              </div>

              <hr className="block h-1 border-0 border-t border-solid border-alice-blue my-5 p-0 w-full" />

              {results.amortizationTable.length > 0
                ? results.amortizationTable.map((item, index) => {
                    return (
                      <div key={index} className="mt-8">
                        {item.header === "Grand Total" ? (
                          <>
                            <div
                              style={{
                                border: "1px solid #DBE1E8",
                                borderTopLeftRadius: "10px",
                                borderTopRightRadius: "10px",
                              }}
                            >
                              <div
                                className="print-grand-total-header bg-denim text-white font-sharp-sans-bold text-base flex justify-between items-center px-4"
                                style={{
                                  borderTopLeftRadius: "10px",
                                  borderTopRightRadius: "10px",
                                  height: "53px",
                                }}
                              >
                                <span className="print-text">
                                  {item.header}
                                </span>
                              </div>
                              <div
                                style={{
                                  height: "53px",
                                  borderBottom: "1px solid #DBE1E8",
                                }}
                                className="flex justify-center items-center px-4 text-neutral-2 font-sharp-sans text-base gap-5"
                              >
                                <span className="flex-1 text-end">
                                  Time Period
                                </span>
                                <span className="flex-1 text-start">
                                  {item.totals.timePeriod}
                                </span>
                              </div>
                              <div
                                style={{
                                  height: "53px",
                                  borderBottom: "1px solid #DBE1E8",
                                }}
                                className="flex justify-center items-center px-4 text-neutral-2 font-sharp-sans text-base gap-5"
                              >
                                <span className="flex-1 text-end">Payment</span>
                                <span className="flex-1 text-start">
                                  {item.totals.payment}
                                </span>
                              </div>
                              <div
                                style={{
                                  height: "53px",
                                  borderBottom: "1px solid #DBE1E8",
                                }}
                                className="flex justify-center items-center px-4 text-neutral-2 font-sharp-sans text-base gap-5"
                              >
                                <span className="flex-1 text-end">
                                  Extra Payment
                                </span>
                                <span className="flex-1 text-start">
                                  {item.totals.extraPayment}
                                </span>
                              </div>
                              <div
                                style={{
                                  height: "53px",
                                  borderBottom: "1px solid #DBE1E8",
                                }}
                                className="flex justify-center items-center px-4 text-neutral-2 font-sharp-sans text-base gap-5"
                              >
                                <span className="flex-1 text-end">
                                  Principal
                                </span>
                                <span className="flex-1 text-start">
                                  {item.totals.principal}
                                </span>
                              </div>
                              <div
                                style={{
                                  height: "53px",
                                  borderBottom: "1px solid #DBE1E8",
                                }}
                                className="flex justify-center items-center px-4 text-neutral-2 font-sharp-sans text-base gap-5"
                              >
                                <span className="flex-1 text-end">
                                  Interest
                                </span>
                                <span className="flex-1 text-start">
                                  {item.totals.interest}
                                </span>
                              </div>
                              <div
                                style={{
                                  height: "53px",
                                }}
                                className="flex justify-center items-center px-4 text-neutral-2 font-sharp-sans text-base gap-5"
                              >
                                <span className="flex-1 text-end">Balance</span>
                                <span className="flex-1 text-start">
                                  {item.totals.balance}
                                </span>
                              </div>
                            </div>

                            <div className="text-denim font-sharp-sans-bold text-3xl text-start mt-10">
                              Full Report
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-denim font-sharp-sans-bold text-base text-start">
                              {item.header}
                            </div>
                            <div
                              className={`${
                                selectedAmortization
                                  ? selectedAmortization === "Yearly"
                                    ? ""
                                    : "container-table"
                                  : ""
                              } mt-4`}
                            >
                              <Table
                                columns={columns}
                                dataSource={manipulateTheData(
                                  item,
                                  selectedAmortization
                                )}
                                pagination={false}
                                scroll={{ x: 690 }}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })
                : null}
            </>
          ) : (
            <>
              <div className="flex flex-col justify-evenly items-end gap-3 w-full">
                <div className="text-neutral-1 font-sharp-sans text-sm">
                  Loan Term Reduction
                </div>
                <h2 className="text-denim my-0 font-sharp-sans-bold text-3xl text-center mt-3">
                  0 Years
                </h2>
              </div>
              <hr className="block h-1 border-0 border-t border-solid border-alice-blue my-5 p-0 w-full" />
              <div className="flex flex-col justify-evenly items-end gap-3 w-full">
                <div className="text-neutral-1 font-sharp-sans text-sm">
                  Interest Savings
                </div>
                <h2 className="text-denim my-0 font-sharp-sans-bold text-3xl text-center mt-3">
                  $0.00
                </h2>
              </div>
              <hr className="block h-1 border-0 border-t border-solid border-alice-blue my-5 p-0 w-full" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default PrepaymentSavings;
