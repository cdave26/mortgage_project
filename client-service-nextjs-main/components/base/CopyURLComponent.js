import React from "react";
import { Button, Popover, Skeleton } from "antd";
import { clipboardWriteText } from "~/plugins/copyToClipboard";
import { useDispatch } from "react-redux";

const CopyURLComponent = ({
  label,
  url,
  isLoading,
  iscalltoaction,
  isbuyer,
  containerClassName,
}) => {
  const dispatch = useDispatch();

  const renderColors = () => {
    if (iscalltoaction) return "bg-blue-2 border-blue-2 text-white";
    return "text-base bg-xanth border-xanth text-neutral-1";
  };

  const baseContainerClassName = "w-full flex-1 ";
  const labels = "font-sharp-sans-medium text-neutral-3";
  const buttonClassName = `${renderColors()} ml-2 text-sm font-sharp-sans-semibold h-auto whitespace-normal break-all border-2 rounded-lg button-wrap `;
  const results = "text-base font-sharp-sans-medium text-neutral-1 overflow-hidden truncate cursor-pointer xl:max-w-[85%]";

  return (
    <div className={baseContainerClassName + (containerClassName || "")}>
      <div className={`flex items-center user-details-header ${labels}`}>
        {label}
        {url && (
          <Button
            size="small"
            onClick={() => clipboardWriteText(url, dispatch)}
            className={buttonClassName}
          >
            Copy URL
          </Button>
        )}
      </div>
      <div
        className={`${
          isLoading ? "onloading" : "user-details-value"
        } ${results}`}
      >
        {isLoading ? (
          <Skeleton paragraph={{ rows: 0 }}/>
        ) : (
          <a href={url} target="_blank">{url || "-"}</a>
        )}
      </div>
    </div>
  );
};

export default CopyURLComponent;
