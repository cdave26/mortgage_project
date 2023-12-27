import React, { useState } from "react";
import CustomDivider from "../base/CustomDivider";
import { Button, Form, Radio } from "antd";
import CustomFormItem from "../base/CustomFormItem";
import CustomInput from "../base/CustomInput";
import config from "~/config";
import CustomButton from "../base/CustomButton";
import Calculator from "~/plugins/calculator";
import Table from "../Table/Table";
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

const LoanPaymentAmortization = () => {
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

  const [form] = Form.useForm();

  const [results, setResults] = useState({});

  const [selectedAmortization, setSelectedAmortization] = useState(null);
  const [resultsSelectedAmortization, setResultsSelectedAmortization] =
    useState(null);

  const [loanType, setLoanType] = useState(null);

  const [formatValues, setFormatValues] = useState({
    loanamount: null,
  });

  const [loading, setLoading] = useState(false);

  const calculate = (calc) => {
    setLoading(true);

    calc = {
      ...calc,
      amortizationTableInterval: calc.amortizationTableInterval.value,
    };

    calc = commaAndDecimal(calc);
    const isValidForm = validateForm(calc);
    if (isValidForm) {
      setLoading(false);
      setResults({});
      return;
    }

    const calculator = new Calculator(calc);
    const result = calculator.calculatePaymentAmortization();
    if (Object.keys(result).length > 0) {
      setResultsSelectedAmortization(calc.amortizationTableInterval);
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

        setFormatValues({
          ...formatValues,
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
          [event.target.name]: formatValues[event.target.name],
        });
      }
    }, 0);
  };

  const beginningDate = (event) => {
    setTimeout(() => {
      const val = form.getFieldValue(event.target.name);
      const cleanSpace = val.replace(/\s/g, "");
      const cleanedValue = cleanSpace.replace(/\D/g, "");
      const formatDateValue =
        cleanedValue.substring(0, 2) +
        (cleanedValue.length > 2 ? "/" : "") +
        cleanedValue.substring(2);

      form.setFieldsValue({
        [event.target.name]: formatDateValue,
      });

      const regex = /^(0[1-9]|1[0-2])\/\d{4}$/;
      if (!regex.test(formatDateValue)) {
        form.setFields([
          {
            name: event.target.name,
            errors: ["Invalid format, eg: mm/yyyy"],
          },
        ]);
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

      if (key !== "No") {
        if (key === "beginningDate") {
          const regex = /^(0[1-9]|1[0-2])\/\d{4}$/;
          if (!regex.test(calc[key])) {
            form.setFields([
              {
                name: key,
                errors: ["Invalid format, eg: mm/yyyy"],
              },
            ]);
            result[key] = true;
          }
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
    <div className="print-section">
      <div className="flex justify-start items-start mb-3">
        <h2 className="text-denim my-0 font-sharp-sans-bold text-3xl text-center">
          Loan Payment & Amortization Calculator
        </h2>
      </div>
      <CustomDivider />
      <div className="text-neutral-2 font-sharp-sans text-base">
        Calculate your monthly mortgage payment for fixed rate or adjustable
        rate loans.
      </div>
      <div className="flex flex-col lg:flex-row gap-20 mt-8 h-full pb-16">
        <div className="w-full lg:w-1/3">
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
                    value={formatValues.loanamount || ""}
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
                  initialvalue="Select"
                  options={monthly}
                  onChange={(opt) => setSelectedAmortization(opt?.value)}
                />
              </CustomFormItem>
              {selectedAmortization ? (
                selectedAmortization !== "No" ? (
                  <CustomFormItem
                    label="Beginning Month and Year"
                    name="beginningDate"
                    required
                    rules={config.requiredRule}
                  >
                    <CustomInput
                      type="text"
                      placeholder="mm/yyyy"
                      onChange={beginningDate}
                      name="beginningDate"
                    />
                  </CustomFormItem>
                ) : null
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

          {Object.keys(results).length > 0 ? (
            <>
              <div className="flex justify-end flex-col w-full">
                {results.monthlypayment ? (
                  <div className="flex flex-col justify-evenly items-end gap-3 w-full">
                    <div className="text-neutral-1 font-sharp-sans text-sm">
                      Monthly Payment
                    </div>
                    <h2 className="text-denim my-0 font-sharp-sans-bold text-3xl text-center mt-3">
                      {checkNegative(results.monthlypayment)}
                    </h2>
                  </div>
                ) : null}
                {results.initialmonthlypayment &&
                results.maximummonthlypayment ? (
                  <>
                    <div className="flex flex-col justify-evenly items-end gap-3 w-full">
                      <div className="text-neutral-1 font-sharp-sans text-sm">
                        Initial Monthly Payment
                      </div>
                      <div className="text-denim my-0 font-sharp-sans-bold text-3xl text-center mt-1">
                        {checkNegative(results.initialmonthlypayment)}
                      </div>
                    </div>
                    <div className="flex flex-col justify-evenly items-end gap-3 w-full mt-5">
                      <div className="text-neutral-1 font-sharp-sans text-sm">
                        Maximum Monthly Payment
                      </div>
                      <div className="text-denim my-0 font-sharp-sans-bold text-3xl text-center mt-1">
                        {checkNegative(results.maximummonthlypayment)}
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
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
                                resultsSelectedAmortization
                                  ? resultsSelectedAmortization === "Yearly"
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
                                scroll={{ x: 690 }}
                                pagination={false}
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
            <div className="flex flex-col justify-evenly items-end gap-3 w-full">
              <div className="text-neutral-1 font-sharp-sans text-sm">
                Monthly Payment
              </div>
              <h2 className="text-denim my-0 font-sharp-sans-bold text-3xl text-center mt-3">
                $0.00
              </h2>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoanPaymentAmortization;
