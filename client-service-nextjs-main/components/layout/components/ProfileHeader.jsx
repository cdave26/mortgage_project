import React from "react";
import { Col, Row, Grid } from "antd";
import { shallowEqual, useSelector } from "react-redux";
import ProfileAvatar from "./ProfileAvatar";

const ProfileHeader = () => {
  const { user } = useSelector((state) => {
    return {
      user: state.auth.data.user,
    };
  }, shallowEqual);

  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const isMobile = screens.lg === false;
  const userFullName = `${user?.first_name} ${user?.last_name}`;

  return (
    <Row gutter={[6, 0]}>
      <Col
        span={22}
        lg={20}
        className="text-end"
        style={{ marginTop: isMobile ? 16 : -8 }}
      >
        <span className="font-sharp-sans">{userFullName}</span>
      </Col>
      <Col span={2} lg={4} className="text-end">
        <ProfileAvatar />
      </Col>
    </Row>
  );
};

export default ProfileHeader;
