import React from "react";
import { Layout } from "antd";
import Link from "next/link";
import { useRouter } from "next/router";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import UplistMenu from "./components/UplistMenu";
import { formDialogAlert, getChangeForm } from "~/store/ui/action";

const { Sider } = Layout;

const SiderComponent = React.memo(() => {
  const router = useRouter();

  const dispatch = useDispatch();

  const {
    formChange: { isChange, isModalOpen, url },
  } = useSelector((state) => {
    return {
      formChange: state.ui.formChange,
    };
  }, shallowEqual);

  const { isAuthenticated } = useSelector((state) => {
    return {
      isAuthenticated: state.auth.data.isAuthenticated,
    };
  }, shallowEqual);

  return (
    <>
      <Sider
        trigger={null}
        width={317}
        className="bg-white navigation-spacing"
        style={{ borderRight: "1px solid #DBE1E8" }}
      >
        <div className="flex justify-center items-center h-[63px] md:h-[120px]">
          <Link
            onClick={(e) => {
              e.preventDefault();
              const runNext = () => {
                if (router.pathname !== "/") {
                  router.push("/");
                }
              };
              if (isAuthenticated) {
                const formChange = getChangeForm();
                const obj = JSON.parse(formChange);
                if (isChange || (formChange && obj && obj.isChange)) {
                  dispatch(formDialogAlert(true, true, "/"));
                } else {
                  runNext();
                }
              } else {
                runNext();
              }
            }}
            href="/"
          >
            <img
              src={`${window.location.origin}/img/uplist_wordmark.png`}
              alt="uplist logo"
              className="w-full h-full"
            />
          </Link>
        </div>
        <div
          style={{ maxHeight: "75%" }}
          className={`menu-bar-sidebar overflow-y-auto`}
        >
          <UplistMenu />
        </div>
      </Sider>
    </>
  );
});

export default SiderComponent;
