import React from 'react'
import Head from 'next/head'
import { UnderMaintenance } from '~/icons/icon'

const MaintenancePage = () => (
  <React.Fragment>
    <Head>
      <title>Maintenance</title>
    </Head>
    <div className="flex flex-col justify-center h-full">
      <div className="flex flex-col items-center gap-5">
        <UnderMaintenance className="maintenance-image"/>
        <div className="flex flex-col items-center text-center">
          <h1 className="font-sharp-sans-bold text-4xl max-w-md mb-15 ">
            We're improving your experience.
          </h1>
          <div className="h-2 w-52 bg-[#FFC160]"/>
          <p className="text-lg font-sharp-sans-medium max-w-xl">
            Uplist is currently undergoing maintenance. We'll be back up and running shortly. Please try again later.
          </p>
        </div>
      </div>
    </div>
  </React.Fragment>
)

export default MaintenancePage
