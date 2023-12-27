import React from 'react';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { Modal as AntdModal } from 'antd';
import { shallowEqual, useSelector } from 'react-redux';
// const { confirm } = AntdModal;

/**
 * Modal Components
 * @param {Object} props
 * @returns
 */
const Modal = (props) => {
    return (
        <AntdModal
            {...props}
            onCancel={props.onCancel}
            title={false}
            open={props.open}
            footer={null}
            width={props.width}
        >
            {props.children}
        </AntdModal>
    );
};

export default Modal;
