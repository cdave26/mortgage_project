import React, { useState } from "react";
import CustomDivider from "../base/CustomDivider";
import { Button, Form } from "antd";
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
function RentVSOwn() {
  const [form] = Form.useForm();

  const [validation, setValidation] = useState({
    monthlyrent: null,
    monthlyrentersinsurance: null,
    homepurchaseprice: null,
    downpayment: null,
  });

  const [results, setResults] = useState({
    shouldyourentorown: null,
    averagemonthlypaymentsavings: {
      label: "Average Monthly Payment Savings",
      value: null,
    },
    estimatedtotalgain: {
      label: "Estimated Total Gain",
      value: null,
    },
    fullReport: [],
  });

  const [loading, setLoading] = useState(false);

  const calculate = (calc) => {
    setLoading(true);
    calc = commaAndDecimal(calc);
    const isValidForm = validateForm(calc);

    if (isValidForm) {
      setLoading(false);
      setResults({
        shouldyourentorown: null,
        averagemonthlypaymentsavings: {
          label: "Average Monthly Payment Savings",
          value: null,
        },
        estimatedtotalgain: {
          label: "Estimated Total Gain",
          value: null,
        },
        fullReport: [],
      });
      return;
    }
    const calculator = new Calculator(calc);
    const results = calculator.calculateRentVsOwn();

    setResults(results);
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
      } else {
        if (name === "annualhomeappreciation") {
          form.setFields([
            {
              name,
              errors: ["Invalid value"],
            },
          ]);
          return;
        }
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
      if (key === "monthlyrent") {
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

      if (key === "annualrentincrease") {
        if (parseFloat(calc[key]) < 0 || parseFloat(calc[key]) > 25) {
          form.setFields([
            {
              name: key,
              errors: ["Value must be between 0 and 25"],
            },
          ]);
          result[key] = true;
        }
      }

      if (key === "monthlyrentersinsurance") {
        if (parseFloat(calc[key]) < 0 || parseFloat(calc[key]) > 10000) {
          form.setFields([
            {
              name: key,
              errors: ["Value must be between 0 and 10,000"],
            },
          ]);
          result[key] = true;
        }
      }

      if (key === "homepurchaseprice") {
        if (parseFloat(calc[key]) > 1000000000 || parseFloat(calc[key]) < 1) {
          form.setFields([
            {
              name: key,
              errors: ["Value must be between 1 and 1,000,000,000"],
            },
          ]);

          result[key] = true;
        }
      }

      if (key === "downpayment") {
        const homepurchaseprice = form.getFieldValue("homepurchaseprice");
        if (
          parseFloat(calc[key]) > parseFloat(removeCommas(homepurchaseprice))
        ) {
          form.setFields([
            {
              name: key,
              errors: ["Value must be less than Home Purchase Price"],
            },
          ]);
          result[key] = true;
        }
      }

      if (key === "mortgageinterestrate") {
        if (parseFloat(calc[key]) < 0 || parseFloat(calc[key]) > 25) {
          form.setFields([
            {
              name: key,
              errors: ["Value must be between 0 and 25"],
            },
          ]);
          result[key] = true;
        }
      }

      if (key === "estimatedhomepurchasecosts") {
        if (parseFloat(calc[key]) < 0 || parseFloat(calc[key]) > 20) {
          form.setFields([
            {
              name: key,
              errors: ["Value must be between 0 and 20"],
            },
          ]);
          result[key] = true;
        }
      }

      if (key === "propertytaxrate") {
        if (parseFloat(calc[key]) < 0 || parseFloat(calc[key]) > 50) {
          form.setFields([
            {
              name: key,
              errors: ["Value must be between 0 and 50"],
            },
          ]);
          result[key] = true;
        }
      }

      if (key === "annualhomemaintenance") {
        if (parseFloat(calc[key]) < 0 || parseFloat(calc[key]) > 50) {
          form.setFields([
            {
              name: key,
              errors: ["Value must be between 0 and 50"],
            },
          ]);
          result[key] = true;
        }
      }

      if (key === "howlongbeforeselling") {
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

      if (key === "annualhomeappreciation") {
        if (isNaN(parseFloat(calc[key]))) {
          form.setFields([
            {
              name: key,
              errors: ["Invalid value"],
            },
          ]);
          result[key] = true;
        } else if (parseFloat(calc[key]) < -50 || parseFloat(calc[key]) > 50) {
          form.setFields([
            {
              name: key,
              errors: ["Value must be between -50 and 50"],
            },
          ]);
          result[key] = true;
        }
      }

      if (key === "sellingcosts") {
        if (parseFloat(calc[key]) < 0 || parseFloat(calc[key]) > 20) {
          form.setFields([
            {
              name: key,
              errors: ["Value must be between 0 and 20"],
            },
          ]);
          result[key] = true;
        }
      }

      if (key === "interestearnedondownpayment") {
        if (parseFloat(calc[key]) < 0 || parseFloat(calc[key]) > 100) {
          form.setFields([
            {
              name: key,
              errors: ["Value must be between 0 and 100"],
            },
          ]);
          result[key] = true;
        }
      }

      if (key === "yourincometaxrate") {
        if (parseFloat(calc[key]) < 0 || parseFloat(calc[key]) > 100) {
          form.setFields([
            {
              name: key,
              errors: ["Value must be between 0 and 100"],
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
          Rent vs Own Calculator
        </h2>
      </div>
      <CustomDivider />
      <div className="text-neutral-2 font-sharp-sans text-base">
        Calculate the difference between renting and buying a home.
      </div>
      <div className="flex flex-col lg:flex-row gap-20 mt-8 h-full pb-16">
        <div className="w-full lg:w-1/3">
          <div className="rounded-3xl border-solid  border border-alice-blue p-5">
            <Form form={form} onFinish={(submit) => calculate(submit)}>
              <CustomFormItem
                label="Monthly Rent"
                name="monthlyrent"
                required
                rules={config.requiredRule}
              >
                <div className="loanamount">
                  <CustomInput
                    type="text"
                    placeholder="0.00"
                    onChange={(event) => onFormat(event, "monthlyrent")}
                    value={validation.monthlyrent || ""}
                    name="monthlyrent"
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
                label="Annual Rent Increase"
                name="annualrentincrease"
                required
                rules={config.requiredRule}
              >
                <div className="percent">
                  <CustomInput
                    type="number"
                    placeholder="0"
                    onChange={(event) => onFormat(event, "annualrentincrease")}
                    onKeyDown={(event) =>
                      onPercent(event, "annualrentincrease")
                    }
                    name="annualrentincrease"
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
                label={`Monthly Renter's Insurance`}
                name="monthlyrentersinsurance"
                required
                rules={config.requiredRule}
              >
                <div className="loanamount">
                  <CustomInput
                    type="text"
                    placeholder="0.00"
                    onChange={(event) =>
                      onFormat(event, "monthlyrentersinsurance")
                    }
                    value={validation.monthlyrentersinsurance || ""}
                    name="monthlyrentersinsurance"
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
                label="Home Purchase Price"
                name="homepurchaseprice"
                required
                rules={config.requiredRule}
              >
                <div className="loanamount">
                  <CustomInput
                    type="text"
                    placeholder="0.00"
                    onChange={(event) => onFormat(event, "homepurchaseprice")}
                    value={validation.homepurchaseprice || ""}
                    name="homepurchaseprice"
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
                label="Down Payment"
                name="downpayment"
                required
                rules={config.requiredRule}
              >
                <div className="loanamount">
                  <CustomInput
                    type="text"
                    placeholder="0.00"
                    onChange={(event) => onFormat(event, "downpayment")}
                    value={validation.downpayment || ""}
                    name="downpayment"
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
                label="Mortgage Interest Rate"
                name="mortgageinterestrate"
                required
                rules={config.requiredRule}
              >
                <div className="percent">
                  <CustomInput
                    type="number"
                    placeholder="0"
                    onChange={(event) =>
                      onFormat(event, "mortgageinterestrate")
                    }
                    onKeyDown={(event) =>
                      onPercent(event, "mortgageinterestrate")
                    }
                    name="mortgageinterestrate"
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
                label="Estimate Home Purchase Costs"
                name="estimatedhomepurchasecosts"
                required
                rules={config.requiredRule}
              >
                <div className="percent">
                  <CustomInput
                    type="number"
                    placeholder="0"
                    onChange={(event) =>
                      onFormat(event, "estimatedhomepurchasecosts")
                    }
                    onKeyDown={(event) =>
                      onPercent(event, "estimatedhomepurchasecosts")
                    }
                    name="estimatedhomepurchasecosts"
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
                label="Property Tax Rate"
                name="propertytaxrate"
                required
                rules={config.requiredRule}
              >
                <div className="percent">
                  <CustomInput
                    type="number"
                    placeholder="0"
                    onChange={(event) => onFormat(event, "propertytaxrate")}
                    onKeyDown={(event) => onPercent(event, "propertytaxrate")}
                    name="propertytaxrate"
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
                label="Annual Home Maintenance"
                name="annualhomemaintenance"
                required
                rules={config.requiredRule}
              >
                <div className="percent">
                  <CustomInput
                    type="number"
                    placeholder="0"
                    onChange={(event) =>
                      onFormat(event, "annualhomemaintenance")
                    }
                    onKeyDown={(event) =>
                      onPercent(event, "annualhomemaintenance")
                    }
                    name="annualhomemaintenance"
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
                label="How Long Before Selling?"
                name="howlongbeforeselling"
                required
                rules={config.requiredRule}
              >
                <div className="monthYear">
                  <CustomInput
                    type="number"
                    onChange={(event) =>
                      onFormat(event, "howlongbeforeselling")
                    }
                    onKeyDown={(event) =>
                      monthsYears(event, "howlongbeforeselling")
                    }
                    name="howlongbeforeselling"
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
                label="Annual Home Appreciation"
                name="annualhomeappreciation"
                required
                rules={config.requiredRule}
              >
                <div className="percent">
                  <CustomInput
                    type="text"
                    placeholder="0"
                    onChange={(event) =>
                      onFormat(event, "annualhomeappreciation")
                    }
                    onKeyDown={(event) =>
                      onPercent(
                        event,
                        "annualhomeappreciation",
                        "allowedNegative"
                      )
                    }
                    name="annualhomeappreciation"
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
                label="Selling Costs"
                name="sellingcosts"
                required
                rules={config.requiredRule}
              >
                <div className="percent">
                  <CustomInput
                    type="number"
                    placeholder="0"
                    onChange={(event) => onFormat(event, "sellingcosts")}
                    onKeyDown={(event) => onPercent(event, "sellingcosts")}
                    name="sellingcosts"
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
                label="Interest Earned On Down Payment"
                name="interestearnedondownpayment"
                required
                rules={config.requiredRule}
              >
                <div className="percent">
                  <CustomInput
                    type="number"
                    placeholder="0"
                    onChange={(event) =>
                      onFormat(event, "interestearnedondownpayment")
                    }
                    onKeyDown={(event) =>
                      onPercent(event, "interestearnedondownpayment")
                    }
                    name="interestearnedondownpayment"
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
                label="Your Income Tax Rate"
                name="yourincometaxrate"
                required
                rules={config.requiredRule}
              >
                <div className="percent">
                  <CustomInput
                    type="number"
                    placeholder="0"
                    onChange={(event) => onFormat(event, "yourincometaxrate")}
                    onKeyDown={(event) => onPercent(event, "yourincometaxrate")}
                    name="yourincometaxrate"
                  />
                  <div className="icon">
                    <img
                      src={`${window.location.origin}/icon/percent.png`}
                      alt="percent"
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
              Should you Rent or Buy?
            </div>
            <h2 className="text-denim my-0 font-sharp-sans-bold text-3xl text-center mt-3">
              {results.shouldyourentorown ? results.shouldyourentorown : "--"}
            </h2>
          </div>
          <hr className="block h-1 border-0 border-t border-solid border-alice-blue my-5 p-0 w-full" />
          <div className="flex flex-col justify-evenly items-end gap-3 w-full">
            <div className="text-neutral-1 font-sharp-sans text-sm">
              {results.averagemonthlypaymentsavings.label}
            </div>
            <h2 className="text-denim my-0 font-sharp-sans-bold text-3xl text-center mt-3">
              {results.averagemonthlypaymentsavings.value
                ? checkNegative(results.averagemonthlypaymentsavings.value)
                : "$0.00"}
            </h2>
          </div>
          <hr className="block h-1 border-0 border-t border-solid border-alice-blue my-5 p-0 w-full" />
          <div className="flex flex-col justify-evenly items-end gap-3 w-full">
            <div className="text-neutral-1 font-sharp-sans text-sm">
              {results.estimatedtotalgain.label}
            </div>
            <h2 className="text-denim my-0 font-sharp-sans-bold text-3xl text-center mt-3">
              {results.estimatedtotalgain.value
                ? checkNegative(results.estimatedtotalgain.value)
                : "$0.00"}
            </h2>
          </div>
          {results.fullReport.length > 0 ? (
            <>
              <div className="text-denim font-sharp-sans-bold text-3xl text-start mt-10">
                Full Report
              </div>
              {results.fullReport.map((item, index) => (
                <div key={index}>
                  <div className="text-denim font-sharp-sans-bold text-base text-start my-8">
                    {item.header}
                  </div>
                  <Table
                    columns={item.rowHeaders}
                    dataSource={item.rows}
                    pagination={false}
                  />
                </div>
              ))}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default RentVSOwn;
