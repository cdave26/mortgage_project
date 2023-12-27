import React, { useEffect } from 'react';
import Head from 'next/head';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import AddLicenseComponent from '~/components/state-license/AddLicenseComponent';
import { getStatesPerCompanyAction } from '~/store/state/action';
import { getLicenseAction, isEditLicenseAction } from '~/store/licenses/action';
import Layout from '~/layout/Layout';
const EditLicenses = () => {
  const dispatch = useDispatch();
  const { updateLicense } = useSelector(
    (state) => state.licenses,
    shallowEqual
  );

  const {
    data: { user: userData },
  } = useSelector((state) => state.auth, shallowEqual);

  useEffect(() => {
    //due to async issue: in the _app.js, the user data is not yet available
    if (userData) {
      dispatch(getStatesPerCompanyAction(userData.company_id));

      const entries = performance.getEntriesByType('navigation');
      if (entries[0].type === 'reload' || entries[0].type === 'navigate') {
        dispatch(isEditLicenseAction(true));
      }

      if (!Object.keys(updateLicense.license).length) {
        const { pathname } = new URL(window.location.href);
        dispatch(getLicenseAction(pathname.split('/').pop()));
      }
    }
  }, [userData]);

  return (
    <>
      <Head>
        <title> Uplist | Edit License </title>
      </Head>
      <Layout>
        <AddLicenseComponent />
      </Layout>
    </>
  );
};

export default EditLicenses;
