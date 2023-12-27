import { Layout as Layouts } from "antd";
const { Header } = Layouts;

const HeaderWrapper = ({ isAuthenticated, children }) => {
  return (
    <Header
      className={`uplist-header w-full bg-white px-0 flex ${
        isAuthenticated && "h-auto py-4 items-center"
      }`}
      style={{
        borderBottom: isAuthenticated ? "1px solid #DBE1E8" : "none",
        height: isAuthenticated ? "auto" : "6rem",
      }}
    >
      {children}
    </Header>
  );
};

export default HeaderWrapper;
