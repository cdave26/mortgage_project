import React, { useState } from "react";
import CustomDivider from "../base/CustomDivider";
import { Button, Form } from "antd";
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
function EarlyPayoff() {
  const [form] = Form.useForm();

  const [validation, setValidation] = useState({
    originalloanamount: null,
  });

  const [results, setResults] = useState({
    additionalmonthlypayment: null,
    currentmonthlypayment: null,
    earlypayoffmonthlypayment: null,
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
        additionalmonthlypayment: null,
        currentmonthlypayment: null,
        earlypayoffmonthlypayment: null,
      });
      return;
    }
    const calculator = new Calculator(calc);
    const result = calculator.calculateEarlyPayoff();
    setResults(result);
    setLoading(false);
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
      if (key === "originalloanamount") {
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

      if (key === "originalinterestrate") {
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

          // return true;
        }
      }

      if (key === "originalloanterm") {
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

      if (key === "monthsalreadypaid") {
        if (Number(calc[key]) > 999 || Number(calc[key]) < 1) {
          form.setFields([
            {
              name: key,
              errors: ["Value must be between 1 and 999"],
            },
          ]);
          result[key] = true;
        }
      }

      if (key === "requestedyearstopayoff") {
        if (Number(calc[key]) > 99 || Number(calc[key]) < 1) {
          form.setFields([
            {
              name: key,
              errors: ["Value must be between 1 and 99"],
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
    <div className="print-section">
      <div className="flex justify-start items-start mb-3">
        <h2 className="text-denim my-0 font-sharp-sans-bold text-3xl text-center">
          Early Payoff Calculator
        </h2>
      </div>
      <CustomDivider />
      <div className="text-neutral-2 font-sharp-sans text-base">
        Find the additional payment required to pay off your loan early.
      </div>
      <div className="flex flex-col lg:flex-row gap-20 mt-8 h-full pb-16">
        <div className="w-full lg:w-1/3">
          <div className="rounded-3xl border-solid  border border-alice-blue p-5">
            <Form form={form} onFinish={(submit) => calculate(submit)}>
              <CustomFormItem
                label="Original Loan Amount"
                name="originalloanamount"
                required
                rules={config.requiredRule}
              >
                <div className="loanamount">
                  <CustomInput
                    type="text"
                    placeholder="0.00"
                    onChange={(event) => onFormat(event, "originalloanamount")}
                    value={validation.originalloanamount || ""}
                    name="originalloanamount"
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
                label="Original Iterest Rate"
                name="originalinterestrate"
                required
                rules={config.requiredRule}
              >
                <div className="percent">
                  <CustomInput
                    type="number"
                    placeholder="0"
                    onChange={(event) =>
                      onFormat(event, "originalinterestrate")
                    }
                    onKeyDown={(event) =>
                      onPercent(event, "originalinterestrate")
                    }
                    name="originalinterestrate"
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
                label="Original Loan Term"
                name="originalloanterm"
                required
                rules={config.requiredRule}
              >
                <div className="monthYear">
                  <CustomInput
                    type="number"
                    onChange={(event) => onFormat(event, "originalloanterm")}
                    onKeyDown={(event) =>
                      monthsYears(event, "originalloanterm")
                    }
                    name="originalloanterm"
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
                label="Months Already Paid"
                name="monthsalreadypaid"
                required
                rules={config.requiredRule}
              >
                <div className="monthYear">
                  <CustomInput
                    type="number"
                    onChange={(event) => onFormat(event, "monthsalreadypaid")}
                    onKeyDown={(event) =>
                      monthsYears(event, "monthsalreadypaid", "isMoth")
                    }
                    name="monthsalreadypaid"
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
                label="Requested Years To Payoff"
                name="requestedyearstopayoff"
                required
                rules={config.requiredRule}
              >
                <div className="monthYear">
                  <CustomInput
                    type="number"
                    onChange={(event) =>
                      onFormat(event, "requestedyearstopayoff")
                    }
                    onKeyDown={(event) =>
                      monthsYears(event, "requestedyearstopayoff")
                    }
                    name="requestedyearstopayoff"
                  />
                  <div className="icon">
                    <img
                      src={`${window.location.origin}/icon/years.png`}
                      alt="years"
                    />
                  </div>
                </div>
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
          <div className="flex flex-col justify-evenly items-end gap-3 w-full">
            <div className="text-neutral-1 font-sharp-sans text-sm">
              Current Monthly Payment
            </div>
            <h2 className="text-denim my-0 font-sharp-sans-bold text-3xl text-center mt-3">
              {results.currentmonthlypayment
                ? checkNegative(results.currentmonthlypayment)
                : "$0.00"}
            </h2>
          </div>
          <hr className="block h-1 border-0 border-t border-solid border-alice-blue my-5 p-0 w-full" />
          <div className="flex flex-col justify-evenly items-end gap-3 w-full">
            <div className="text-neutral-1 font-sharp-sans text-sm">
              Early Payoff Monthly Payment
            </div>
            <h2 className="text-denim my-0 font-sharp-sans-bold text-3xl text-center mt-3">
              {results.earlypayoffmonthlypayment
                ? checkNegative(results.earlypayoffmonthlypayment)
                : "$0.00"}
            </h2>
          </div>
          <hr className="block h-1 border-0 border-t border-solid border-alice-blue my-5 p-0 w-full" />
          <div className="flex flex-col justify-evenly items-end gap-3 w-full">
            <div className="text-neutral-1 font-sharp-sans text-sm">
              Additional Monthly Payment
            </div>
            <h2 className="text-denim my-0 font-sharp-sans-bold text-3xl text-center mt-3">
              {results.additionalmonthlypayment
                ? checkNegative(results.additionalmonthlypayment)
                : "$0.00"}
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EarlyPayoff;
