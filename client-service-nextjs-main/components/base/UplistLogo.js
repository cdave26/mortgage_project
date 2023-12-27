import React from "react";
import Image from "next/image";

const UplistLogo = () => {
  return (
    <Image
      src={`/img/uplist_wordmark.png`}
      width={100}
      height={52}
      alt="uplist logo"
      className="max-w-[300px]"
    />
  );
};

export default UplistLogo;
