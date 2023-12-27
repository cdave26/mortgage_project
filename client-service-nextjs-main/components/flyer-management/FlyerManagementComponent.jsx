import React, { useState } from "react";
import { Tabs } from "antd";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";

import { viewAllFlyers } from "~/store/flyers/action";
import { getGeneratedFlyersAPI } from "~/store/flyers/api";
import { defaultPagination } from "~/utils/constants";
import { exportCSV } from "~/plugins/exportCSV";
import userTypes from "~/enums/userTypes";
import config from "~/config";

import ContentHeader from "../base/common/ContentHeader";
import ProgressModal from "../base/modal/ProgressModal";
import FlyerManagementTable from "./FlyerManagementTable";

const FlyerManagementComponent = () => {
  const [activeTab, setActiveTab] = useState("1");
  const [processCSV, setProcessCSV] = useState(false);

  const dispatch = useDispatch();

  const { user, flyers } = useSelector((state) => {
    return {
      flyers: state.flyers.listOfFlyers,
      user: state.auth.data.user,
    };
  }, shallowEqual);

  const handleTabChange = (key) => {
    setActiveTab(key);
    onRequest(key === "1" ? "active" : "archive");
  };

  const onRequest = (activeArchive) => {
    dispatch(
      viewAllFlyers({
        page: 1,
        limit: defaultPagination.pageSize,
        sortBy: "",
        search: "",
        addressSearch: "",
        activeArchive,
        created_by: "",
        companyId: null,
      })
    );
  };
  const onExportCSV = async () => {
    setProcessCSV(true);
    const controller = new AbortController();
    const { signal } = controller;
    const dd = dayjs().format("MM-DD-YYYY");

    try {
      const response = await getGeneratedFlyersAPI(
        {
          search: flyers.search,
          addressSearch: flyers.addressSearch,
          activeArchive: flyers.activeArchive,
          createdBy: flyers.created_by,
          companyId: flyers.companyId,
        },
        signal
      );

      if (!response.data.length) {
        dispatch({
          type: "UI/snackbars",
          payload: {
            open: true,
            message: "Warning",
            description: "Cannot export empty data.",
            position: "topRight",
            type: "warning",
          },
        });
        return;
      }

      const formatted = response.data.map((flyer) => {
        const flyerUrl = `${config.storagePath}${flyer.generated_flyer}`;

        let mapped = {
          "MLS Number": flyer.mls_number,
          "Flyer File Name": flyer.generated_flyer.replace(
            "generated_pdf/",
            ""
          ),
          Address: flyer.partial_address,
          "Created By": `${flyer.user_first_name} ${flyer.user_last_name}`,
          "Date Generated": dayjs(flyer.generated_flyer_created_at).format(
            "MM-DD-YYYY"
          ),
        };

        if (user?.user_type_id === userTypes.UPLIST_ADMIN) {
          mapped = {
            ...mapped,
            Company: flyer.company_name,
            "Flyer URL": flyerUrl,
          };
        } else {
          mapped = {
            ...mapped,
            "Flyer URL": flyerUrl,
          };
        }

        return mapped;
      });

      exportCSV(formatted, `flyer-database-list-${dd}`);
    } catch (err) {
      console.log("err", err);
      controller.abort();
    } finally {
      setProcessCSV(false);
    }
  };

  return (
    <>
      <ContentHeader
        title={"Flyer Database"}
        hasExportCSVBtn
        CSVHandler={onExportCSV}
      />
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        className="my-0 font-sharp-sans-semibold flyer-management-tabs text-base"
        items={[
          {
            key: "1",
            label: <div className="px-10 text-base">Active</div>,
            children: <FlyerManagementTable />,
          },
          {
            key: "2",
            label: <div className="px-10 text-base">Archive</div>,
            children: <FlyerManagementTable />,
          },
        ]}
      ></Tabs>
      <ProgressModal open={processCSV} name="CSV" />
    </>
  );
};

export default FlyerManagementComponent;
