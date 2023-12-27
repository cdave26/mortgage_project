import React from "react";
import {
  checkAdditionalConditions,
  parseDisclaimerParagraphs,
} from "~/utils/disclosures";

const DisclosureAndAssumptionsComponent = ({
  licenseData,
  hasBuyDownSelected,
}) => {
  const {
    company: { additional_details },
    state: { disclosure },
  } = licenseData;

  const disclosures = JSON.parse(disclosure);
  const hasDisclosures = Object.keys(disclosures).length > 0;
  return (
    <div className="text-start">
      <p className="text-neutral-2 text-body-3 font-sharp-sans-medium">
        APR=Annual Percentage Rate: A rate that reflects the actual annual cost
        of a loan and includes the loan interest rate, private mortgage
        insurance, points, and certain fees.
      </p>
      <p className="text-neutral-2 text-body-3 font-sharp-sans-medium">
        The APR includes the approximate cost of prepaid finance charges,
        including 10 days of prepaid interest, points associated with the rate
        displayed, and some third-party fees. It does not include other closing
        costs. Actual APRs for individual loans may differ. All loan
        applications are subject to credit and property approval. Your interest
        rate will depend on specific characteristics of your transaction and
        your credit profile up to the time of closing. If your down payment or
        equity is less than 20%, mortgage insurance will be required, which will
        increase the monthly payment. The information provided assumes no other
        loans or liens on subject property. Property and/or flood hazard
        insurance may be required. Maximum loan limits may apply. Additional
        rates and programs are available. Hazard insurance is required, and
        flood insurance may be required if the property is located in a flood
        zone. Payments reflected for the monthly amounts for property taxes and
        insurance premiums are estimated for this purpose and do not include
        amounts for flood insurance. Actual payments may be higher.
      </p>
      <p className="text-neutral-2 text-body-3 font-sharp-sans-medium">
        This potential mortgage loan rate/product/parameters quote is not a
        credit decision or a commitment to lend and your interest rate is
        subject to change which will depend on various factors including your
        type of loan, credit profile, property value, occupancy, loan size, etc.
        Rates and product availability may also vary based on the State or
        region in which the property is located, your debt ratio, credit
        history, income and asset structure, property condition, your number of
        other financed properties, and other factors. Offer is subject to normal
        credit qualifications and underwriting qualifications. Rates are subject
        to change. Consult your tax advisor regarding the deductibility of
        interest. Some restrictions may apply.
      </p>
      {hasBuyDownSelected && (
        <p className="text-neutral-2 text-body-3 font-sharp-sans-medium">
          *A temporary buydown reduces the initial rate by up to 3%. Adjusts 1%
          each year, returns to original fixed rate after buy down period. For
          example, a 2-1 buydown Conventional 30 year fixed rate loan with a
          purchase price of $400,000, down payment of 20%, and an annual
          percentage rate of 7.076% would result in an interest rate of 4.875%
          (monthly P&I payment of $1,693.47) for the first year, 5.875% (monthly
          P&I payment of $1,892.92) for the second year, and 6.875% at cost of
          1.375 points paid at closing (monthly P&I payment of $2,102.17) for
          the third year which will continue for the life of the loan
          thereafter.
        </p>
      )}
      <p className="text-neutral-2 text-body-3 font-sharp-sans-medium">
        Any nontraditional mortgage products or reduced documentation mortgage
        loans (example - limited documentation, reduced documentation, no
        documentation loans) are products that may have higher interest rates,
        more points or more fees than products requiring full documentation.
      </p>

      {/* STATE DISCLOSURE */}
      <p className="text-neutral-2 text-body-3 font-sharp-sans-medium">
        {hasDisclosures &&
          parseDisclaimerParagraphs(disclosures.default, licenseData)}
      </p>
      {checkAdditionalConditions(licenseData) ? (
        <p className="text-neutral-2 text-body-3 font-sharp-sans-medium">
          {hasDisclosures &&
            parseDisclaimerParagraphs(disclosures.additional, licenseData)}
        </p>
      ) : (
        <></>
      )}

      {/* COMPANY ADDED DETAILS */}
      {additional_details ? (
        <p className="text-neutral-2 text-body-3 font-sharp-sans-medium whitespace-pre-line">
          {additional_details}
        </p>
      ) : (
        <></>
      )}

      {/* STATE LICENSING INFORMATION */}
      {/* TODO: TEMPORARY HIDDEN. UNCOMMENT IF THIS WILL BE NEEDED */}
      {/* <p className="text-neutral-2 text-body-3 font-sharp-sans-medium whitespace-pre-line">
                  {parseDisclaimerParagraphs(
                    licensingInformation.default,
                    licenseData
                  )}
                </p>

                {checkAdditionalConditions(licenseData) ? (
                  <p className="text-neutral-2 text-body-3 font-sharp-sans-medium whitespace-pre-line">
                    {parseDisclaimerParagraphs(
                      licensingInformation.additional,
                      licenseData
                    )}
                  </p>
                ) : (
                  <></>
                )} */}

      {/* Additional State Specific Required Disclosures */}
      {/* TODO: TEMPORARY HIDDEN. UNCOMMENT IF THIS WILL BE NEEDED */}
      {/* {!!additionalRequiredDisclosures ? (
                  <>
                    <p className="text-neutral-2 text-body-3 font-sharp-sans-medium whitespace-pre-line">
                      {parseDisclaimerParagraphs(
                        checkAdditionalConditions(licenseData)
                          ? additionalRequiredDisclosures.default
                          : additionalRequiredDisclosures.additional,
                        licenseData
                      )}
                    </p>
                  </>
                ) : (
                  <></>
                )} */}
    </div>
  );
};

export default DisclosureAndAssumptionsComponent;
