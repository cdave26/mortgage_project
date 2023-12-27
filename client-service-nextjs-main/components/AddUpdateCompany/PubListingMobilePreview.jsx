import React from "react";
import { Button, Form, Radio } from "antd";

import CustomFormItem from "../base/CustomFormItem";
import CustomInput from "../base/CustomInput";
import CustomSelect from "../base/CustomSelect";

const PubListingMobilePreview = ({ theme, headerBgColor }) => {
  const conformingYearFixed = [
    {
      label: "Rate/APR",
      value: "",
    },
    {
      label: "Monthly P&I",
      value: "",
    },
    {
      label: "Taxes",
      value: "",
    },
    {
      label: "Insurance",
      value: "",
    },
    {
      label: "MI",
      value: "",
    },
    {
      label: "Total Payment",
      value: "",
    },
  ];
  const FHAYearFixed = [
    {
      label: "Rate/APR",
      value: "",
    },
    {
      label: "Monthly P&I",
      value: "",
    },
    {
      label: "Taxes",
      value: "",
    },
    {
      label: "Insurance",
      value: "",
    },
  ];
  return (
    <div className="w-full lg:w-1/3 h-full">
      <div
        className="w-full"
        style={{
          border: "1px solid #DBE1E8",
          borderRadius: "24px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            height: "278px",
            borderRadius: "24px 24px 0px 0px",
            marginBottom: "34px",
            paddingTop: "7px",
          }}
          className="header-background-color"
        >
          <div
            className="flex items-center justify-between h-[45px] bg-white"
            style={{
              padding: " 0 20px",
              height: "45px",
              borderRadius: "24px 24px 0 0",
            }}
          >
            <div className="flex items-center justify-between w-full gap-1">
              <div className="mr-2">
                <img
                  className="w-full"
                  src={
                    theme.preview
                      ? theme.preview
                      : `${window.location.origin}/img/clear-image.jpg`
                  }
                  alt="logo"
                  style={{ height: "45px", objectFit: "contain" }}
                />
              </div>
              <div className="ml-2">
                <img
                  src={`${window.location.origin}/icon/BurgerMenuIcon.png`}
                  alt="humberger-icon"
                />
              </div>
            </div>
          </div>
          <div
            className="flex items-center justify-center flex-col font-bold"
            style={{
              color: theme.headerTextColor,
              fontSize: "25px",
              transition: "color 0.3s ease",
              backgroundColor: headerBgColor,
              padding: "30px 0",
              marginTop: "5px",
            }}
          >
            <div className="mb-3">Listing Address</div>
            <div className="mb-3">Price</div>
            <div className="mb-3">Loan Amount</div>
            <div className="mb-3">Military/Veteran</div>
          </div>
        </div>
        <div style={{ margin: "10px 0 0", padding: "0 30px" }}>
          <Form disabled={true}>
            <div className="flex flex-col md:flex-row  gap-4 w-full">
              <div className="flex-1 w-full">
                <CustomFormItem
                  label="Purchase Price"
                  name="purchase_price"
                  required
                >
                  <CustomInput type="text" />
                </CustomFormItem>
              </div>
              <div className="flex-1 w-full">
                <CustomFormItem label="Occupancy" name="occupancy" required>
                  <CustomSelect
                    initialvalue="Select Occupancy"
                    options={[]}
                    className="w-full"
                    disabled={true}
                  />
                </CustomFormItem>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4 w-full">
              <div className="flex-1">
                <CustomFormItem
                  label="Down Payment"
                  name="down_payment"
                  required
                >
                  <CustomInput type="text" />
                </CustomFormItem>
              </div>
              <div className="flex-1">
                <CustomFormItem label="Down %" name="down_percent" required>
                  <CustomInput type="text" />
                </CustomFormItem>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 w-full">
              <div className="flex-1">
                <CustomFormItem
                  label="Credit Score"
                  name="credit_score"
                  required
                >
                  <CustomSelect
                    initialvalue="Credit Score"
                    options={[]}
                    // onChange={handleChange}
                    className="text-neutral-2 font-sharp-sans-medium"
                    disabled={true}
                  />
                </CustomFormItem>
              </div>
              <div className="flex-1">
                <CustomFormItem
                  label="Seller Credit"
                  name="seller_credit"
                  required
                >
                  <CustomInput type="text" />
                </CustomFormItem>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4 w-full">
              <div className="flex-1">
                <CustomFormItem label="Military/Veteran?" required>
                  <Radio.Group
                    value={"Yes"}
                    disabled={true}
                    className="input-radio view-only"
                  >
                    <Radio value={"Yes"}>Yes</Radio>
                    <Radio value={"No"}>No</Radio>
                  </Radio.Group>
                </CustomFormItem>
              </div>
              <div className="flex-1">
                <CustomFormItem label="First Time Home Buyer?" required>
                  <Radio.Group
                    value={"No"}
                    disabled={true}
                    className="input-radio view-only"
                  >
                    <Radio value={"Yes"}>Yes</Radio>
                    <Radio value={"No"}>No</Radio>
                  </Radio.Group>
                </CustomFormItem>
              </div>
            </div>
            <div className="flex justify-center items-center mt-5">
              <Button
                className="flex justify-between justify-items-center items-center text-neutral-7 bg-denim"
                style={{ padding: "18px 24px" }}
              >
                <span className="text-neutral-7">GET PAYMENTS</span>
              </Button>
            </div>
          </Form>

          <div className="year-fixed">
            <div
              className="text-black text-center font-bold mt-5"
              style={{ fontSize: "16px", padding: "10px 0" }}
            >
              Conforming 30 Year Fixed
            </div>
            <div className="container-company">
              {conformingYearFixed.map((item, index) => {
                return (
                  <div key={index} className="mini-table">
                    <div
                      className={`${
                        item.label === "Total Payment" ? "totalPayment" : ""
                      }`}
                    >
                      {item.label}
                    </div>
                    <div> {item.value ? item.value : "-"}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="year-fixed">
            <div
              className="text-black text-center mt-5 font-bold"
              style={{ fontSize: "16px", padding: "10px 0" }}
            >
              FHA 30 Year Fixed
            </div>
            <div className="container-company">
              {FHAYearFixed.map((item, index) => {
                return (
                  <div key={index} className="mini-table">
                    <div>{item.label}</div>
                    <div> {item.value ? item.value : "-"}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <div
            className="text-sm text-neutral-3 text-center my-5"
            style={{ padding: "10px 0" }}
          >
            Note : Mobile preview for potential borrowers
          </div>
        </div>
      </div>
    </div>
  );
};

export default PubListingMobilePreview;
