import React, { useState } from "react";
import { Skeleton } from "antd";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import CustomDivider from "../base/CustomDivider";
import { dateTimeFormat } from "~/plugins/dateTimeFormat";
import { trimTheState } from "~/plugins/trimState";
import DeleteButton from "../base/buttons/DeleteButton";
import ConfirmDeleteModal from "../base/modal/ConfirmDeleteModal";
import UpdateButton from "../base/buttons/UpdateButton";
import { deleteCompanyAction } from "~/store/company/action";
import { useRouter } from "next/router";
import BackButton from "../base/buttons/BackButton";
import config from "~/config";
import CopyURLComponent from "../base/CopyURLComponent";

const labels = "font-sharp-sans-medium text-neutral-3",
  results = "text-base font-sharp-sans-medium text-neutral-1";

const CompanyDetails = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const { company, loading, state, stateLoading } = useSelector((state) => {
    return {
      state: state.licenseStates.states.data,
      company: state.company.myCompany.company,
      loading: state.company.myCompany.loading,
      stateLoading: state.licenseStates.states.loading,
    };
  }, shallowEqual);

  const { pricingEngineLoading, pricingEngineList } = useSelector((state) => {
    return {
      pricingEngineList: state.pricingEngine.pricing.data,

      pricingEngineLoading: state.pricingEngine.pricing.loading,
    };
  }, shallowEqual);

  const { user } = useSelector((state) => {
    return {
      user: state.auth.data.user,
    };
  }, shallowEqual);

  const [isDelete, setIsDelete] = useState({
    open: false,
    onProgress: false,
  });

  // if (!loading) {
  //   if (company === undefined) {
  //     return (
  //       <div className='flex justify-center items-center'>
  //         <h1 className='text-center text-3xl font-bold'>No company found</h1>
  //       </div>
  //     );
  //   } else {
  //     if (Object.keys(company).length === 0) {
  //       return (
  //         <div className='flex justify-center items-center'>
  //           <h1 className='text-center text-3xl font-bold'>No company found</h1>
  //         </div>
  //       );
  //     }
  //   }
  // }

  const handleDeleteCompany = async (comp) => {
    setIsDelete({
      ...isDelete,
      onProgress: true,
    });
    const dd = await dispatch(deleteCompanyAction(comp.id));
    if (dd) {
      setIsDelete({
        ...isDelete,
        open: false,
        onProgress: false,
      });
      setTimeout(() => {
        router.push("/company");
      }, 500);
    } else {
      setIsDelete({
        ...isDelete,
        onProgress: false,
      });
    }
  };

  const onChekPriceEngine = (id, loading, list) => {
    if (!loading) {
      if (list.length > 0) {
        return list.filter((item) => item.value === id)[0].label;
      }
    }
  };

  const checkIfValidURL = (str) => {
    //check if the url is valid
    var pattern = new RegExp(
      "^(https?:\\/\\/)?" + // protocol
        "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
        "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
        "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
        "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
        "(\\#[-a-z\\d_]*)?$",
      "i"
    ); // fragment locator
    return !!pattern.test(str);
  };

  const companyLicense = (license, stateLicence) => {
    return license.licenseState.length > 0 ? (
      licenseMetaData(license, stateLicence)
    ) : (
      <>Company state license not found</>
    );
  };

  /**
   * Load the company license state
   * @param {Object} license
   * @param {Array} stateLicence
   * @returns
   */
  const licenseMetaData = (license, stateLicence) => {
    return license.licenseState.map((elLicense) =>
      stateLicence
        .filter((item) => item.key === elLicense.license.state_id)
        .map((item, index) => {
          return (
            <div key={index}>
              <div className="flex justify-between items-start flex-col lg:flex-row my-5">
                <div className="md:w-1/4 mb-2 md:mb-2">
                  <div className={`title ${labels}`}>License State</div>
                  <div className={`result mt-1 ${results}`}>{item.value}</div>
                </div>
                <div className="md:w-1/4">
                  <div className={`title ${labels}`}>License Number</div>
                  <div className={`result mt-1 ${results}`}>
                    {elLicense.license.license}
                  </div>
                </div>
              </div>
              <hr />

              {elLicense.license.metadata.length > 0
                ? elLicense.license.metadata.map((metaItem, index) => {
                    return (
                      <div key={index}>
                        {" "}
                        {metaItem.name === trimTheState(item.value)
                          ? metaItem.validation.map((sel, selIndex) => (
                              <div key={selIndex}>
                                {sel.name === "Branch Address" ? (
                                  <div className="address flex flex-col lg:flex-row w-full">
                                    {sel.selection.map((addR, index) => {
                                      return (
                                        <div
                                          key={index}
                                          className={`container-company  mt-3 ${
                                            addR.full_title === "Address"
                                              ? "grow"
                                              : "w-64"
                                          }`}
                                        >
                                          <div
                                            className={`title w-full  mb-1 ${labels}`}
                                          >
                                            {addR.full_title}
                                          </div>
                                          <div className={`result ${results}`}>
                                            {addR.value}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <>
                                    <div className={`title ${labels}`}>
                                      {sel.name}
                                    </div>
                                    <div
                                      className={
                                        metaItem.name === "California"
                                          ? "input-check-box input-radio flex flex-col"
                                          : "input-radio input-check-box flex items-center justify-start gap-2 mr-2"
                                      }
                                    >
                                      {sel.selection.map((re, index) => {
                                        return (
                                          <div key={index} className="checkbox">
                                            {metaItem.name === "California" ? (
                                              <div className="mt-1">
                                                <input
                                                  type="checkbox"
                                                  checked={re.checked}
                                                  disabled={re.disabled}
                                                  onChange={() => null}
                                                />
                                                <label> {re.full_title}</label>
                                              </div>
                                            ) : (
                                              <div className="redaio-button mt-1">
                                                <input
                                                  type="radio"
                                                  checked={re.checked}
                                                  disabled={re.disabled}
                                                  onChange={() => null}
                                                />
                                                <label className="ml-3">
                                                  {re.full_title}
                                                </label>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </>
                                )}
                              </div>
                            ))
                          : null}
                      </div>
                    );
                  })
                : null}
            </div>
          );
        })
    );
  };
  return (
    <>
      <BackButton handleBack={() => window.history.back()} />
      <div className="flex flex-col lg:flex-row justify-between items-start mt-10 mb-3">
        <h2 className="text-denim my-0 font-sharp-sans-bold text-3xl text-center truncate line-clamp-2">
          Company Details
        </h2>
        <div className="flex flex-col md:flex-row lg:flex-row">
          <div className="mt-6 lg:mt-0 mr-4">
            <UpdateButton
              href={`/company/${company.id}`}
              onClick={(event) => {
                event.preventDefault();
                router.push(`/company/${company.id}`);
                dispatch({
                  type: "MY_COMPANY",
                  payload: {
                    loading: true,
                    company: {},
                    isUpdate: true,
                  },
                });
              }}
            />
          </div>
          {Number(user.user_type_id) === 1 ? (
            <div className="mt-6 lg:mt-0">
              <DeleteButton
                onClick={() => {
                  setIsDelete({
                    ...isDelete,
                    open: true,
                  });
                }}
              />
            </div>
          ) : null}
        </div>
      </div>
      <CustomDivider />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mt-10 pb-16">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="border border-solid border-alice-blue box-border rounded-2xl p-8 w-full"
          >
            {i == 0 ? (
              <div className="company-informatio">
                <div className="text-denim text-2xl font-sharp-sans-bold pb-8 truncate line-clamp-2">
                  Company Information
                </div>
                <div className="flex justify-start items-start flex-col lg:flex-row  w-full pb-8 gap-4">
                  <div className="md:w-2/5 mb-2 md:mb-2">
                    <div className={`user-details-header ${labels}`}>ID</div>
                    <div
                      className={`${
                        loading ? "onloading" : "user-details-value"
                      } ${results}`}
                    >
                      {loading ? (
                        <Skeleton paragraph={{ rows: 0 }} />
                      ) : (
                        company.id
                      )}
                    </div>
                  </div>
                  <div className="md:w-1/4 w-full flex-1">
                    <div
                      className={`user-details-header truncate line-clamp-2 ${labels}`}
                    >
                      Create On
                    </div>
                    <div
                      className={`${
                        loading ? "onloading" : "user-details-value truncate"
                      } ${results} line-clamp-2`}
                    >
                      {loading ? (
                        <Skeleton paragraph={{ rows: 0 }} />
                      ) : (
                        dateTimeFormat(company.created_at, "MM DD YYYY")
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-start items-start flex-col lg:flex-row w-full pb-8 gap-4">
                  <div className="md:w-2/5 mb-2 md:mb-2">
                    <div className={`user-details-header ${labels}`}>
                      Company Name
                    </div>
                    <div
                      className={`${
                        loading ? "onloading" : "user-details-value"
                      } ${results}`}
                    >
                      {loading ? (
                        <Skeleton paragraph={{ rows: 0 }} />
                      ) : (
                        company.name
                      )}
                    </div>
                  </div>
                  <div className="md:w-1/4 w-full flex-1">
                    <div className={`user-details-header ${labels}`}>
                      Company NMLS#
                    </div>
                    <div
                      className={`${
                        loading ? "onloading" : "user-details-value"
                      } ${results}`}
                    >
                      {loading ? (
                        <Skeleton paragraph={{ rows: 0 }} />
                      ) : (
                        company.company_nmls_number
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-start items-start flex-col lg:flex-row w-full pb-8 gap-4">
                  <div className="md:w-2/5 mb-2 md:mb-2">
                    <div className={`user-details-header ${labels}`}>
                      Company Privacy Policy URL
                    </div>
                    <div
                      className={`${
                        loading ? "onloading" : "user-details-value"
                      } ${results}`}
                    >
                      {loading ? (
                        <Skeleton paragraph={{ rows: 0 }} />
                      ) : checkIfValidURL(
                          company.company_privacy_policy_URL
                        ) ? (
                        <>
                          <a
                            href={company.company_privacy_policy_URL}
                            target="_blank"
                            className="break-all text-xanth"
                          >
                            {company.company_privacy_policy_URL}
                          </a>
                        </>
                      ) : (
                        company.company_privacy_policy_URL
                      )}
                    </div>
                  </div>
                  <div className="md:w-1/4 w-full flex-1">
                    <div className={`user-details-header ${labels}`}>
                      Company Terms of Service URL
                    </div>
                    <div
                      className={`${
                        loading ? "onloading" : "user-details-value"
                      } ${results}`}
                    >
                      {loading ? (
                        <Skeleton paragraph={{ rows: 0 }} />
                      ) : company.company_terms_of_tervice_URL ? (
                        checkIfValidURL(
                          company.company_terms_of_tervice_URL
                        ) ? (
                          <>
                            <a
                              href={company.company_terms_of_tervice_URL}
                              target="_blank"
                              className="break-all text-xanth"
                            >
                              {company.company_terms_of_tervice_URL}
                            </a>
                          </>
                        ) : (
                          company.company_terms_of_tervice_URL
                        )
                      ) : (
                        "-"
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-start items-start flex-col lg:flex-row w-full pb-8 gap-4">
                  <div className="md:w-2/5 mb-2 md:mb-2">
                    <div className={`user-details-header ${labels}`}>
                      Company Phone Number
                    </div>
                    <div
                      className={`${
                        loading ? "onloading" : "user-details-value"
                      } ${results}`}
                    >
                      {loading ? (
                        <Skeleton paragraph={{ rows: 0 }} />
                      ) : (
                        company.company_mobile_number
                      )}
                    </div>
                  </div>
                  <div className="md:w-1/4 w-full flex-1">
                    <div className={`user-details-header ${labels}`}>
                      Price Engine
                    </div>
                    <div
                      className={`${
                        loading ? "onloading" : "user-details-value"
                      } ${results}`}
                    >
                      {loading ? (
                        <Skeleton paragraph={{ rows: 0 }} />
                      ) : (
                        onChekPriceEngine(
                          company.pricing_engine_id,
                          pricingEngineLoading,
                          pricingEngineList
                        )
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-start items-start flex-col lg:flex-row w-full pb-8 gap-4">
                  <div className="md:w-2/5 mb-2 md:mb-2">
                    <div className={`user-details-header ${labels}`}>
                      Address
                    </div>
                    <div
                      className={`${
                        loading ? "onloading" : "user-details-value"
                      } ${results}`}
                    >
                      {loading ? (
                        <Skeleton paragraph={{ rows: 0 }} />
                      ) : (
                        company.address
                      )}
                    </div>
                  </div>
                  <div className="md:w-1/4 w-full flex-1">
                    <div className={`user-details-header ${labels}`}>City</div>
                    <div
                      className={`${
                        loading ? "onloading" : "user-details-value"
                      } ${results}`}
                    >
                      {loading ? (
                        <Skeleton paragraph={{ rows: 0 }} />
                      ) : (
                        company.city
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-start items-start flex-col lg:flex-row w-full pb-8 gap-4">
                  <div className="md:w-2/5 mb-2 md:mb-2">
                    <div className={`user-details-header ${labels}`}>State</div>
                    <div
                      className={`${
                        loading ? "onloading" : "user-details-value"
                      } ${results}`}
                    >
                      {loading ? (
                        <Skeleton paragraph={{ rows: 0 }} />
                      ) : (
                        company.state
                      )}
                    </div>
                  </div>
                  <div className="md:w-1/4 w-full flex-1">
                    <div className={`user-details-header ${labels}`}>Zip</div>
                    <div
                      className={`${
                        loading ? "onloading" : "user-details-value"
                      } ${results}`}
                    >
                      {loading ? (
                        <Skeleton paragraph={{ rows: 0 }} />
                      ) : (
                        company.zip
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-start items-start flex-col lg:flex-row w-full pb-8 gap-4">
                  <div className="md:w-2/5 mb-2 md:mb-2">
                    <div className={`user-details-header ${labels}`}>Label</div>
                    <div
                      className={`${
                        loading ? "onloading" : "user-details-value"
                      } ${results}`}
                    >
                      {loading ? (
                        <Skeleton paragraph={{ rows: 0 }} />
                      ) : company.equal_housing ? (
                        company.equal_housing == "equal_housing_lender" ? (
                          "Equal Housing Lender (EHL)"
                        ) : (
                          "Equal Housing Opportunity (EHO)"
                        )
                      ) : (
                        "-"
                      )}
                    </div>
                  </div>
                  <CopyURLComponent
                    label={"Login URL"}
                    url={company?.login_url}
                    isLoading={loading}
                    containerClassName={"md:w-1/4"}
                  />
                </div>
              </div>
            ) : i == 1 ? (
              <div className="theme">
                <div className="text-denim text-2xl font-sharp-sans-bold pb-8 truncate line-clamp-2">
                  Theme
                </div>

                <div className="flex justify-start items-start flex-col lg:flex-row w-full pb-8 gap-4">
                  <div className="md:w-2/5 mb-2 md:mb-2">
                    <div className={`user-details-header ${labels}`}>
                      Header Background Color
                    </div>
                    <div
                      className={`${
                        loading ? "onloading" : "user-details-value"
                      }`}
                    >
                      {loading ? (
                        <Skeleton paragraph={{ rows: 0 }} />
                      ) : (
                        <div
                          style={{
                            background: `${
                              company.header_background_color
                                ? company.header_background_color
                                : "#0662C7"
                            }`,
                          }}
                          className="h-8 w-full md:w-2/3"
                        />
                      )}
                    </div>
                  </div>
                  <div className="md:w-1/4">
                    <div className={`user-details-header ${labels}`}>
                      Header Text Color
                    </div>
                    <div
                      className={`${
                        loading ? "onloading" : "user-details-value"
                      }`}
                    >
                      {loading ? (
                        <Skeleton paragraph={{ rows: 0 }} />
                      ) : (
                        <div className="input-radio flex items-center justify-start gap-2 mr-2">
                          <input
                            type="radio"
                            id="whiteDefault"
                            name="headerTextColor"
                            value="#fff"
                            checked={true}
                            className="headerTextColor"
                            onChange={(e) => null}
                          />
                          <label
                            htmlFor="whiteDefault"
                            style={{
                              color: "#00162E",
                              fontSize: "12px",
                              fontFamily: "sharp-sans",
                            }}
                            className={`${results} `}
                          >
                            {company.header_text_color === "#fff"
                              ? "White (Default)"
                              : "Black"}
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-start items-start flex-col lg:flex-row  w-full pb-8 gap-4">
                  <div className="md:w-1/4">
                    <div className={`user-details-header ${labels}`}>Logo</div>
                    <div
                      className={`${
                        loading ? "onloading" : "user-details-value"
                      }`}
                    >
                      {loading ? (
                        <Skeleton paragraph={{ rows: 0 }} />
                      ) : company.company_logo ? (
                        <img
                          src={`${config.storagePath}${company.company_logo}`}
                          alt="logo"
                          loading="lazy"
                          style={{
                            width: "198px",
                            height: "80px",
                            objectFit: "contain",
                          }}
                        />
                      ) : (
                        "-"
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : i == 2 ? (
              <div className="company-state-license">
                <div className="text-denim text-2xl font-sharp-sans-bold pb-8 truncate line-clamp-2">
                  Company State License
                </div>
                {loading || stateLoading
                  ? "Loading"
                  : companyLicense(company, state)}
              </div>
            ) : i == 3 ? (
              <div className="additional-details">
                <div className="text-denim text-2xl font-sharp-sans-bold pb-8 truncate line-clamp-2">
                  Additional details
                </div>

                <div className={`title ${labels} truncate line-clamp-2`}>
                  Additional Listing Details
                </div>
                <div className={`result ${results}`}>
                  {company.additional_details
                    ? company.additional_details
                    : "-"}{" "}
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>
      <ConfirmDeleteModal
        title="You are about to delete a company"
        subtitle="Are you sure that you want to delete this company?"
        handleDelete={() => handleDeleteCompany(company)}
        handleCancel={() => setIsDelete({ ...isDelete, open: false })}
        openModal={isDelete.open}
        onProgress={isDelete.onProgress}
      />
    </>
  );
};

export default CompanyDetails;
