import React from 'react';

const Error = ({ statusCode }) => {
    return <> {statusCode ? `An error ${statusCode} occurred` : 'Error'} </>;
};

Error.getInitialProps = ({ res, err }) => {
    const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
    return { statusCode };
};

export default Error;
