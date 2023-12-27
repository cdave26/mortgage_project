import React, { useEffect, useState } from "react";
import Head from "next/head";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { startCase } from "lodash";
import { useRouter } from "next/router";

import { checkPubQuickQuoteAction } from "~/store/publicstore/action";
import { getCompanyByCodeAction } from "~/store/company/action";

import PublicLayout from "~/layout/PublicLayout";
import PublicQuicQuoteComponent from "~/components/public/quick-quote/PublicQuickQuoteComponent";

const PublicQuickQuote = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [firstRender, setFirstRender] = useState(true);

  const { id, companyName: code } = router.query;

  const { myCompany } = useSelector((state) => {
    return {
      myCompany: state.company.myCompany,
    };
  }, shallowEqual);

  let url_identifier = "";
  let nmls_id = "";

  if (id) {
    const breakdown = id.split("-");
    nmls_id = breakdown[0];
    url_identifier = breakdown[1];
  }

  useEffect(() => {
    dispatch(getCompanyByCodeAction(code));
    dispatch(
      checkPubQuickQuoteAction(
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
        <title>{`${constructCompanyCode()} | Quick Quote - ${url_identifier}`}</title>
      </Head>
      <PublicLayout>
        <PublicQuicQuoteComponent
          firstRender={firstRender}
          url_identifier={url_identifier}
        />
      </PublicLayout>
    </>
  );
};

export default PublicQuickQuote;
