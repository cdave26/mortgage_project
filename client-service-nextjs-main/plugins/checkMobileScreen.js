import { Grid } from "antd";

const checkMobileScreen = () => {
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const isMobile = screens.lg === false;

  return isMobile;
};

export default checkMobileScreen;
