import React, { useEffect } from "react";
import Head from "next/head";
import UserList from "~/components/UserList/UserList";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { getUserListAction } from "~/store/users/action";
import { getCompanyListByIdAction } from "~/store/company/action";
import { getPricingEngineAction } from "~/store/pricingEngine/action";
import { userTypeURL } from "~/plugins/userTypeURL";
import Layout from "~/layout/Layout";
import { defaultPagination } from "~/utils/constants";

const LoanOfficerPage = () => {
  const dispatch = useDispatch();

  const {
    data: { user: userData },
  } = useSelector((state) => state.auth, shallowEqual);

  useEffect(() => {
    if (userData) {
      dispatch(
        getUserListAction({
          page: 1,
          limit: defaultPagination.pageSize,
          search: "",
          companyId: "",
          priceEngineId: "",
          userType: userTypeURL(),
          sortBy: encodeURIComponent(
            JSON.stringify({
              ["created_at"]: "DESC",
            })
          ),
          filteredBy: "",
        })
      );
      dispatch(getCompanyListByIdAction());
      dispatch(getPricingEngineAction());
    }
  }, [userData]);
  return (
    <>
      <Head>
        <title> Uplist | Loan Officer </title>
      </Head>
      <Layout>
        <UserList />
      </Layout>
    </>
  );
};

export default LoanOfficerPage;
