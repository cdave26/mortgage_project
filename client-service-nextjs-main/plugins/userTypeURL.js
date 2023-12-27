/**
 * Type of URL Return number
 * 1 - /Uplist Admin
 * 2 - /Loan Officer
 * 3 - /Company Admin
 * @returns {Number} 1, 2, 3
 */
export const userTypeURL = () => {
    const { pathname } = new URL(window.location.href);
    if (pathname.split('/').pop() === 'uplist-admin') return 1;
    if (pathname.split('/').pop() === 'company-admin') return 2;
    if (pathname.split('/').pop() === 'loan-officer') return 3;
    if (pathname.split('/').pop() === 'users') return 0;
};
