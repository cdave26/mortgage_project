const options = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  timeZoneName: 'short',
  hour12: false,
  // timeZone: 'UTC',
};

/**
 * Convert date time
 * @param {String} date
 * @param {String} format
 * @returns {String} date time
 */
export const dateTimeFormat = (date, format) => {
  if (typeof date !== 'string') {
    throw new Error('Date must be a string');
  }

  if (typeof format !== 'string') {
    throw new Error('Format must be a string');
  }

  if (date === null || date === undefined || date === '') {
    throw new Error('Date is required');
  }

  if (format === null || format === undefined || format === '') {
    throw new Error('Format is required');
  }

  const dateObj = new Date(date);
  const formatter = new Intl.DateTimeFormat(undefined, options);
  const [
    { value: month },
    ,
    { value: day },
    ,
    { value: year },
    ,
    { value: hour },
    ,
    { value: minute },
    ,
    { value: second },
    ,
    { value: timeZoneName },
  ] = formatter.formatToParts(dateObj);

  //add a format based on the UI requirement
  switch (format) {
    case 'MM DD YYYY':
      return `${month} ${day}, ${year}`;
    case 'MM-DD-YYYY':
      const monthNumber = new Date(`${month} 1, ${year}`).getMonth() + 1;
      return `${monthNumber < 10 ? `0${monthNumber}` : monthNumber}-${
        Number(day) < 10 ? `0${day}` : day
      }-${year}`;
    default:
      return `${year}-${month}-${day}`;
  }
};
