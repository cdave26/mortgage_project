import React, { useEffect } from 'react';
import Head from 'next/head';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import LicenseDetails from '~/components/state-license/LicenseDetails';
import { getLicenseAction, isEditLicenseAction } from '~/store/licenses/action';
import Layout from '~/layout/Layout';
const ViewLicenses = () => {
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
      if (!Object.keys(updateLicense.license).length) {
        const { pathname } = new URL(window.location.href);
        dispatch(getLicenseAction(pathname.split('/').pop()));
      }
    }
  }, [userData]);

  return (
    <>
      <Head>
        <title> Uplist | View License </title>
      </Head>
      <Layout>
        <LicenseDetails />
      </Layout>
    </>
  );
};

export default ViewLicenses;
