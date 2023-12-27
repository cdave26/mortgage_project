import { Col, Collapse } from "antd";
import { addCommas } from "~/plugins/formatNumbers";
import { PlusSquareOutlined, MinusSquareOutlined } from "@ant-design/icons";
import { isEmpty, size } from "lodash";

const RenderGetPaymentsResultContainer = ({ getPaymentResults, source }) => {
  return getPaymentResults.map((result, idx) => {
    if (!Object.keys(result).length && !result.length) return <></>;

    const {
      name,
      interest_rate,
      monthly_principal_interest,
      annual_percentage_rate,
      search_id,
      total_payment,
      tax,
      homeowners_association_fee,
      insurance,
      mortgage_insurance,
      // lock_period,
      product_id,
      quote_number,
      buydown,
      buydown_cost,
    } = result;

    // retain incase used
    const isQuickQuote = source === "quick-quote";

    const itemContainerClass =
      "flex flex-row items-center justify-between w-full text-neutral-3 font-sharp-sans-medium ";

    const buydowns = {
      1: '1-0',
      2: '2-1',
      3: '3-2-1',
    }

    const BuydownTitle = () => {
      if (isEmpty(buydown)) return
      return <div className="font-sharp-sans-bold text-center
        text-neutral-1 text-xl md:text-2xl mb-2">
          {buydowns[size(buydown)]} BUYDOWN
      </div>
    }

    const BuydownCost = () => {
      if (isEmpty(buydown)) return
      return <div className="flex flex-col text-center">
        {buydowns[size(buydown)]} Buydown Cost: ${addCommas(buydown_cost, true)}
        <span className="text-sm">
          (typically paid by seller)
        </span>
      </div>
    }

    const { Panel } = Collapse

    const buydownHeader = total => (<div className="flex
      justify-between text-base">
        <span>Total Payment</span>
        <span>${addCommas(total, true)}</span>
    </div>)

    return (
      <Col
        key={idx}
        className="w-full"
        xs={24}
        sm={24}
        md={24}
        lg={12}
        style={{ maxWidth: 500 }}
      >
        <div className="bg-gray-1 text-base flex-1 h-full w-full mx-auto justify-center items-center border border-solid border-alice-blue rounded-lg p-4 pb-0 md:px-8">
          <div className="mb-4">
            <BuydownTitle/>
            <h4 className="capitalize font-sharp-sans-bold text-neutral-1 my-0 text-lg md:text-xl">
              {name === "NonConforming" ? "Jumbo" : name} 30 Year Fixed
            </h4>
            <p id="product_id" className="hidden">
              {product_id}
            </p>
          </div>
          <div className="flex gap-2 w-full mx-auto flex-col">
            <div className="flex flex-row items-center justify-between w-full">
              <p className="my-0 text-neutral-3">Rate/APR</p>
              <p className="my-0 text-neutral-1 font-sharp-sans-bold">
                {interest_rate.toFixed(3) ?? 0}% /{" "}
                {annual_percentage_rate.toFixed(3) ?? 0}%
              </p>
            </div>
            <div className={itemContainerClass}>
              <p className="my-0">Monthly P&I</p>
              <p className="my-0">
                ${addCommas(monthly_principal_interest, true)}
              </p>
            </div>
            <div className={itemContainerClass}>
              <p className="my-0">Taxes</p>
              <p className="my-0">${addCommas(tax, true)}</p>
            </div>
            <div className={itemContainerClass}>
              <p className="my-0">Insurance</p>
              <p className="my-0">${addCommas(insurance, true)}</p>
            </div>
            {!!mortgage_insurance ? (
              <div className={itemContainerClass}>
                <p className="my-0">MI</p>
                <p className="my-0">${addCommas(mortgage_insurance, true)}</p>
              </div>
            ) : (
              <></>
            )}
            <div className="flex flex-row items-center justify-between w-full text-neutral-1 font-sharp-sans-bold">
              <p className="my-0">Total PMT</p>
              <p className="my-0 text-neutral-1">
                ${addCommas(total_payment, true)}
              </p>
            </div>
            {!!homeowners_association_fee ? (
              <div className="flex flex-row justify-between w-full text-neutral-3 font-sharp-sans-medium">
                <p className="my-0">HOA Dues</p>
                <p className="my-0">
                  ${addCommas(homeowners_association_fee, true)}
                </p>
              </div>
            ) : (
              <></>
            )}
            {!isEmpty(buydown) &&
              <div className="flex flex-col font-sharp-sans-bold gap-2 text-neutral-1">
                {Object.keys(buydown).map(year => <div key={year} className="flex flex-col
                  border border-solid border-[#808080] bg-[#f6f6f6] gap-1.5 py-3">
                    <div className="flex justify-between ml-3 mr-11">
                      <span>Year {year} Rate</span>
                      <span>{buydown[year].interest_rate.toFixed(3)}%</span>
                    </div>
                    <Collapse
                      className="buydown-collapse border-none bg-transparent"
                      expandIconPosition="end"
                      expandIcon={antCollapse => antCollapse.isActive
                        ? <MinusSquareOutlined/> : <PlusSquareOutlined/>}
                    >
                      <Panel header={buydownHeader(buydown[year].total_payment)}
                        className="font-sharp-sans-medium text-base">
                        <div className="flex flex-col text-neutral-3 gap-1.5">
                          <div className="flex justify-between ml-3 mr-11">
                            <span>Monthly P&I</span>
                            <span>${addCommas(buydown[year].monthly_principal_interest, true)}</span>
                          </div>
                          <div className="flex justify-between ml-3 mr-11">
                            <span>Taxes</span>
                            <span>${addCommas(buydown[year].tax, true)}</span>
                          </div>
                          <div className="flex justify-between ml-3 mr-11">
                            <span>Insurance</span>
                            <span>${addCommas(buydown[year].insurance, true)}</span>
                          </div>
                          {!!buydown[year]?.mortgage_insurance &&
                            <div className="flex justify-between ml-3 mr-11">
                              <span>MI</span>
                              <span>${addCommas(buydown[year].mortgage_insurance, true)}</span>
                            </div>
                          }
                        </div>
                      </Panel>
                    </Collapse>
                  </div>
                )}
                <BuydownCost/>
              </div>
            }
          </div>
        </div>
        <div
          className="text-center mx-auto"
          style={{
            maxWidth: getPaymentResults.length === 1 ? "622px" : "auto",
          }}
        >
          <p className="my-0 text-neutral-3 font-sharp-sans-semibold">
            REF - {search_id}
            {quote_number ? `, ES${quote_number}` : ""}
          </p>
        </div>
      </Col>
    );
  });
};

export default RenderGetPaymentsResultContainer;
