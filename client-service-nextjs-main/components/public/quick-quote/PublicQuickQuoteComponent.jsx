import React, { useEffect, useState } from "react";
import { Collapse, Row } from "antd";
import { DownOutlined, LoadingOutlined } from "@ant-design/icons";
import { shallowEqual, useDispatch, useSelector } from "react-redux";

import { setPubQuickQuoteStatesAction } from "~/store/publicstore/action";
import { parseWholeAmount, removeNonIntegers } from "~/plugins/formatNumbers";

import QuickQuoteComponent from "~/components/quick-quote/QuickQuoteComponent";
import CustomButton from "~/components/base/CustomButton";
import LoanOfficerDetails from "~/components/base/LoanOfficerDetails";
import QuickQuoteInquiryModal from "./QuickQuoteInquiryModal";
import DisclosureAndAssumptionsComponent from "~/components/disclosureAndAssumptions/DisclosureAndAssumptionsComponent";
import { filter, isEmpty } from "lodash";
import buydown from "~/enums/buydown";

const PublicQuicQuoteComponent = ({ firstRender, url_identifier }) => {
  const dispatch = useDispatch();
  const isMobileDevice =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  const {
    publicQuickQuoteData,
    // sellerCredits, // comment out when needed to use
    selectedState,
    hasResult,
    resultsData,
  } = useSelector(
    (state) => ({
      publicQuickQuoteData: state?.publicStore?.publicQuickQuote?.data,
      // sellerCredits: state?.publicStore?.publicQuickQuote?.sellerCredits,
      selectedState: state?.publicStore?.publicQuickQuote?.selectedState,
      hasResult: state?.publicStore?.publicQuickQuote?.hasResult,
      resultsData: state?.publicStore?.publicQuickQuote?.resultsData,
    }),
    shallowEqual
  );

  const { mobile_number, licenses, company } = publicQuickQuoteData
  const { Panel } = Collapse
  const [licenseData, setLicenseData] =  useState(null)
  const [hasBuyDownSelected, setHasBuyDownSelected] = useState(false)

  useEffect(() => {
    if (isEmpty(resultsData)) return

    const license = filter(licenses, {
        id: resultsData.state.key,
    })[0]

    const companyState = filter(company.company_state_licenses, {
      state_id: resultsData.state.state_id,
    })[0]

    setLicenseData({
      user: publicQuickQuoteData,
      state: license.state,
      license,
      company,
      state_metadata: companyState
        ? JSON.stringify(companyState.state_metadata) : '[]',
      company_state_license: companyState
        ? companyState.license : null,
    })

    setHasBuyDownSelected(resultsData.buydown !== buydown.NONE)
  }, [resultsData])

  return (
    <>
      {/* added loader for checking */}
      {firstRender ? (
        <div className="h-screen flex-col flex text-center justify-center items-center">
          <LoadingOutlined className="items-center justify-center text-denim text-5xl mb-5" />
          <p className="text-neutral-1 mt-0 font-sharp-sans-medium text-base">
            Please wait for a while we are checking some requirements.
          </p>
        </div>
      ) : (
        <div className="pt-4">
          <QuickQuoteComponent url_identifier={url_identifier} />

          {hasResult && (
            <Row className="mb-10 flex items-center justify-center text-center">
              <h3 className="font-sharp-sans my-0">
                Pricing assumes seller credit of $
                {parseWholeAmount(resultsData?.seller_credits)}
              </h3>
            </Row>
          )}

          {selectedState === "Utah" && (
            <div className="w-full mb-10 text-center">
              <p
                className="text-neutral-1 font-sharp-sans-semibold text-base flex-1 w-full mx-auto my-0 justify-center items-center"
                style={{ maxWidth: "622px" }}
              >
                We are unable to provide information regarding this property for
                sale. Please contact a licensed real estate agent.
              </p>
            </div>
          )}

          <Row className="w-full mx-auto max-w-[834px] mb-5">
            <div className="mb-2 text-center w-full">
              <p className="my-0 text-neutral-1 text-base font-sharp-sans-bold">
                Contact me for details or other loan options
              </p>
            </div>
            <div className="bg-gray-2 w-full mx-auto flex justify-center items-center flex-col border border-solid border-alice-blue rounded-lg p-8">
              <LoanOfficerDetails userData={publicQuickQuoteData} />
              <div className="flex gap-4 flex-row flex-wrap items-center justify-center">
                {isMobileDevice && mobile_number && (
                  <>
                    <CustomButton
                      iscalltoaction
                      label="Call"
                      type="link"
                      href={`tel:${removeNonIntegers(mobile_number)}`}
                    />
                    <CustomButton
                      iscalltoaction
                      label="Text"
                      type="link"
                      href={`sms:${removeNonIntegers(mobile_number)}`}
                    />
                  </>
                )}
                <CustomButton
                  iscalltoaction
                  label="Email"
                  onClick={() =>
                    dispatch(
                      setPubQuickQuoteStatesAction({ showInquiryModal: true })
                    )
                  }
                />
              </div>
            </div>
          </Row>
          {!isEmpty(resultsData) &&
            <Row className="mt-10 w-full mx-auto max-w-[834px]">
              <div className="w-full mx-auto flex justify-center items-center flex-col">
                <Collapse className="bg-white w-full mx-auto flex justify-center items-center flex-col">
                  <Panel
                    header="Disclosures and Assumptions"
                    className="homerates-collapse-panel w-full text-base md:text-xl font-sharp-sans-bold border-alice-blue rounded-lg"
                    showArrow={false}
                    extra={<DownOutlined style={{ fontSize: 18 }} />}
                  >
                    {
                      <DisclosureAndAssumptionsComponent
                        licenseData={licenseData}
                        hasBuyDownSelected={hasBuyDownSelected}
                      />
                    }
                  </Panel>
                </Collapse>
              </div>
            </Row>
          }
          <Row className="mt-10 pb-16 flex justify-center">
            <div className="w-20 h-20">
              <img
                src={`${window.location.origin}/icon/${company.equal_housing}.png`}
                alt={`${company.equal_housing}-logo-png-transparent`}
                loading="lazy"
                className="w-full h-full"
              />
            </div>
          </Row>
          <QuickQuoteInquiryModal />
        </div>
      )}
    </>
  );
};

export default PublicQuicQuoteComponent;
