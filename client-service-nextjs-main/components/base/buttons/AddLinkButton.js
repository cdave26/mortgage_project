import React from "react";
import Link from "next/link";

const AddLinkButton = (props) => {
  const { label, href, className } = props;

  const baseClassName =
    "flex justify-center items-center gap-3 text-neutral-1 font-sharp-sans-semibold whitespace-normal break-all text-base h-full w-auto px-5 rounded-lg bg-xanth ";

  return (
    <Link
      {...props}
      href={href}
      className={baseClassName + (className || "")}
      style={{ minHeight: 40, maxHeight: 40 }}
    >
      <img
        src={`${window.location.origin}/icon/addIcon.png`}
        alt="add-icon"
        loading="lazy"
        style={{ width: 14, height: 14 }}
      />
      <span>{label}</span>
    </Link>
  );
};

export default AddLinkButton;
