import React from "react";

const EmptyOBResultsComponent = () => {
  return (
    <div className="my-10 flex items-center justify-center text-center">
      <p className="font-sharp-sans-bold text-neutral-3">
        No Results available for the selected options. You can try again using
        different options or contact us directly so we can help.
      </p>
    </div>
  );
};

export default EmptyOBResultsComponent;
