const LoanOfficerDetails = ({ userData }) => {
  const { first_name, last_name, job_title, email, mobile_number, nmls_num } =
    userData;

  return (
    <>
      <div className="mb-1">
        <h5 className="my-0 text-base text-neutral-1 font-sharp-sans-bold capitalize">
          {first_name} {last_name}
        </h5>
      </div>
      <div className="mb-1">
        <p className="my-0 text-sm text-neutral-2 font-sharp-sans-medium">
          {job_title}
        </p>
      </div>
      <div className="mb-1 flex items-center gap- flex-col md:flex-row">
        <p className="text-neutral-2 text-sm font-sharp-sans-medium my-0">
          {email}
        </p>
      </div>
      <div className="mb-1 flex items-center gap-2 flex-col md:flex-row">
        <p className="text-neutral-2 text-sm font-sharp-sans-medium my-0">
          {mobile_number ? mobile_number : ""}
        </p>
      </div>
      <div className="mb-10 flex items-center">
        <p className="text-neutral-2 text-sm font-sharp-sans-medium my-0">
          NMLS# {nmls_num}
        </p>
      </div>
    </>
  );
};

export default LoanOfficerDetails;
