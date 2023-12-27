import React, { useEffect, useState } from "react";
import { LoadingOutlined } from "@ant-design/icons";
import Head from "next/head";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { startCase } from "lodash";

import { checkPubListingAction } from "~/store/publicstore/action";
import { getCompanyByCodeAction } from "~/store/company/action";

import PublicLayout from "~/layout/PublicLayout";
import AgentListingComponent from "~/components/public/listing/AgentListingComponent";

const AgentListing = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [firstRender, setFirstRender] = useState(true);

  const { id, companyName: code } = router.query;

  const { myCompany } = useSelector((state) => {
    return {
      myCompany: state.company.myCompany,
    };
  }, shallowEqual);

  let url_identifier;
  let nmls_id;

  if (id) {
    const breakdown = id.split("-");
    nmls_id = breakdown[0];
    url_identifier = breakdown[1];
  }

  useEffect(() => {
    dispatch(getCompanyByCodeAction(code));
    dispatch(
      checkPubListingAction(
        { company_code: code, nmls_id, url_identifier },
        setFirstRender
      )
    );
  }, []);

  const constructCompanyCode = () => {
    if (Object.keys(myCompany?.company).length) {
      return myCompany?.company?.name;
    }

    if (!code) return "";

    return startCase(code);
  };

  return (
    <>
      <Head>
        <title>{`${constructCompanyCode()} | Agent Listing - ${url_identifier}`}</title>
      </Head>
      <PublicLayout>
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
            <AgentListingComponent />
          </div>
        )}
      </PublicLayout>
    </>
  );
};

export default AgentListing;
