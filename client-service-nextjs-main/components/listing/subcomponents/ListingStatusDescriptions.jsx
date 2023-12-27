import React from "react";

const ListingStatusDescriptions = () => {
  const statuses = [
    {
      title: "Active/Published",
      desc: "Instantly publishes the page to public.",
    },
    {
      title: "Sale Pending",
      desc: "Instantly publishes the page to public.",
    },
    {
      title: "Listing Sold",
      desc: "The property listing is already sold.",
    },
    {
      title: "Listing Cancelled",
      desc: "The property listing is cancelled.",
    },
    {
      title: "Draft",
      desc: "Creates an entry, but will not be shown to public until published.",
    },
    {
      title: "Flyer Pending Review",
      desc: "If you want someone else to look at and approve this listing.",
    },
    {
      title: "Archive",
      desc: "The property listing is archived.",
    },
  ];
  return (
    <div className="flex flex-col mt-1">
      {statuses.map((status, index) => {
        return (
          <span key={index} className="font-sharp-sans text-xxs">
            <span className="text-denim font-sharp-sans-bold">
              {status.title}
            </span>{" "}
            - {status.desc}
          </span>
        );
      })}
    </div>
  );
};

export default ListingStatusDescriptions;
