import React from "react";
import { Layout as Layouts, Grid } from "antd";
import dayjs from "dayjs";

const { Footer } = Layouts;

const FooterComponent = () => {
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const isMobile = screens.lg === false;
  const padding = isMobile ? "py-3" : "py-0";

  return (
    <Footer
      className={`bg-white text-center flex items-center justify-center max-h-9 text-xs my-0 ${padding} h-full text-neutral-3 font-sharp-sans`}
      style={{ borderTop: "1px solid #DBE1E8" }}
      id="_app-footer_"
    >
      &copy; {dayjs().year()} Uplist LLC
    </Footer>
  );
};

export default FooterComponent;
