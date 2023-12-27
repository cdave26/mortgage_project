import Link from "next/link";
import React from "react";

const BackButton = ({ handleBack }) => {
  return (
    <div className="w-fit">
      <Link
        href={window.history.state.url}
        className="flex flex-row justify-start items-center gap-2 cursor-pointer text-neutral-1"
        onClick={(e) => {
          e.preventDefault();
          handleBack();
        }}
      >
        <img
          src={`${window.location.origin}/icon/back-arrow.png`}
          alt="back"
          lazy="loading"
        />
        <span className="text-base font-semibold">Back</span>
      </Link>
    </div>
  );
};

export default BackButton;
