import React from 'react';
import { notification } from 'antd';

import { useSelector, shallowEqual, useDispatch } from 'react-redux';

const Snackbar = () => {
  const { snackbars } = useSelector((state) => state.ui, shallowEqual);
  const [api, contextHolder] = notification.useNotification();
  const dispatch = useDispatch();

  const snackbarsClose = () => {
    dispatch({
      type: 'UI/snackbars',
      payload: {
        open: false,
        message: '',
        description: '',
        position: '',
        type: '',
      },
    });
  };

  return (
    <>
      {contextHolder}
      {snackbars.open
        ? api[snackbars.type]({
            message: (
              <span
                dangerouslySetInnerHTML={{
                  __html: snackbars.message,
                }}
              />
            ),
            description: (
              <span
                dangerouslySetInnerHTML={{
                  __html: snackbars.description,
                }}
              />
            ),
            onClick: snackbarsClose(),
            onClose: snackbarsClose(),
            placement: snackbars.position,
          })
        : null}
    </>
  );
};

export default Snackbar;
