import { addCommas } from './formatNumbers';
/**
 * Calculator
 * @class Calculator
 * @classdesc Calculator class
 * @param {Object} formData - Form data
 */
class Calculator {
  #formData = {};
  constructor(formData) {
    if (typeof formData !== 'object') {
      throw new Error('Invalid form data');
    }
    this.#formData = formData;
  }

  /**
   * Calculate the Loan payment & Amortization
   * @returns {Object} results
   */
  calculatePaymentAmortization() {
    const results = {};
    let amortizationSchedule;
    const {
      beginningDate,
      interestrate,
      loanamount,
      loanterm,
      loantype,
      amortizationTableInterval,
      maxlifetimerateincrease,
      maxperiodicrateincrease,
      presentratechangesafter,
      ratecanchangeevery,
    } = this.#formData;

    const termMonths = Number(loanterm) * 12;
    const monthlyRate = Number(interestrate) / 100 / 12;
    const loanAmount = Number(loanamount);
    const beginningdate = beginningDate
      ? this.#getDateFromMonthAndYear(beginningDate)
      : this.#getDateForBeginningOfCurrentMonth();

    const monthlyPayment = this.#getMonthlyPayment(
      monthlyRate,
      termMonths,
      loanAmount
    );
    if (loantype === 'Fixed Rate') {
      if (amortizationTableInterval !== 'No') {
        amortizationSchedule = this.#getAmortizationSchedule({
          monthlyRate,
          loanAmount,
          termMonths,
          monthlyPayment,
          beginningDate: beginningdate,
        });
      }
      results.monthlypayment = monthlyPayment;
      results.initialmonthlypayment = '';
      results.maximummonthlypayment = '';
    } else {
      //adjustable rate
      const maxPeriodicMonthlyRateIncrease =
        Number(maxperiodicrateincrease) / 100 / 12;
      const maxLifetimeMonthlyRateIncrease =
        Number(maxlifetimerateincrease) / 100 / 12;
      const monthsWithInitialRate = Number(presentratechangesafter);
      const monthsBetweenRateChanges = Number(ratecanchangeevery);
      amortizationSchedule = this.#getAmortizationSchedule({
        monthlyRate,
        loanAmount,
        termMonths,
        monthlyPayment,
        maxPeriodicMonthlyRateIncrease,
        maxLifetimeMonthlyRateIncrease,
        monthsWithInitialRate,
        monthsBetweenRateChanges,
        beginningDate: beginningdate,
      });
      const maxMonthlyPayment = Math.max.apply(
        Math,
        amortizationSchedule.map((s) => {
          return s.payment;
        })
      );

      results.initialmonthlypayment = monthlyPayment;
      results.maximummonthlypayment = maxMonthlyPayment;
      results.monthlypayment = '';
    }

    if (amortizationTableInterval !== 'No' && amortizationSchedule) {
      results.amortizationTable = this.#getAmortizationTableFromSchedule(
        amortizationSchedule,
        amortizationTableInterval
      );
    }

    if (!results.hasOwnProperty('amortizationTable')) {
      results.amortizationTable = [];
    }

    this.#onScroll();

    return results;
  }

  /**
   * Calculate the Early Payoff
   * @returns {Object} results
   */
  calculateEarlyPayoff() {
    const {
      monthsalreadypaid,
      originalinterestrate,
      originalloanamount,
      originalloanterm,
      requestedyearstopayoff,
    } = this.#formData;

    const originalTermMonths = Number(originalloanterm) * 12;
    const newTermMonths = Number(requestedyearstopayoff) * 12;
    const monthlyRate = Number(originalinterestrate) / 100 / 12;
    const monthsAlreadyPaid = Number(monthsalreadypaid);
    const originalLoanAmount = Number(originalloanamount);
    const currentMonthlyPayment = this.#getMonthlyPayment(
      monthlyRate,
      originalTermMonths,
      originalLoanAmount
    );
    const remainingBalance =
      originalLoanAmount -
      this.#getPrincipalAndInterestPaid(
        monthlyRate,
        originalLoanAmount,
        currentMonthlyPayment,
        0,
        monthsAlreadyPaid
      ).principalPaid;
    const earlyPayoffMonthlyPayment = this.#getMonthlyPayment(
      monthlyRate,
      newTermMonths,
      remainingBalance
    );
    const additionalMonthlyPayment =
      earlyPayoffMonthlyPayment - currentMonthlyPayment;

    this.#onScroll();

    return {
      currentmonthlypayment: String(currentMonthlyPayment),
      earlypayoffmonthlypayment: String(earlyPayoffMonthlyPayment),
      additionalmonthlypayment: additionalMonthlyPayment
        .toFixed(2)
        .replace(/-/g, ''),
    };
  }

  /**
   * Calculate the Prepayment Savings
   * @returns {Object} results
   */

  calculatePrepaymentSavings() {
    const results = {};
    let amortizationScheduleNoAdditionalPayment;
    let amortizationSchedule;
    let amortizationScheduleParams;
    const {
      additionalPaymentAmountFrequency,
      additionalpaymentamount,
      amortizationTableInterval,
      interestrate,
      loantype,
      makefirstadditionalpayment,
      presentloanbalance,
      remainingloantermmonth,
      remainingloantermyear,
      maxlifetimerateincrease,
      maxperiodicrateincrease,
      presentratechangesafter,
      ratecanchangeevery,
    } = this.#formData;
    const additionalPaymentAmount = Number(additionalpaymentamount);
    const loanBalance = Number(presentloanbalance);
    const interestRate = Number(interestrate) / 100;
    const remainingLoanTermYears = Number(remainingloantermyear);
    const remainingLoanTermMonths = Number(remainingloantermmonth);

    const originalTermMonths =
      remainingLoanTermYears * 12 + parseInt(remainingLoanTermMonths, 10);
    const monthlyRate = interestRate / 12;
    const originalMonthlyPayment = this.#getMonthlyPayment(
      monthlyRate,
      originalTermMonths,
      loanBalance
    );
    const beginningDate = this.#getDateForBeginningOfCurrentMonth();
    amortizationScheduleParams = {
      monthlyRate: monthlyRate,
      loanAmount: loanBalance,
      termMonths: originalTermMonths,
      monthlyPayment: originalMonthlyPayment,
      firstAdditionalPayment: makefirstadditionalpayment,
      additionalPaymentAmountFrequency: additionalPaymentAmountFrequency,
      beginningDate: beginningDate,
    };

    if (loantype !== 'Fixed Rate') {
      // Adjustable Rate
      amortizationScheduleParams.maxPeriodicMonthlyRateIncrease =
        Number(maxperiodicrateincrease) / 100 / 12;
      amortizationScheduleParams.maxLifetimeMonthlyRateIncrease =
        Number(maxlifetimerateincrease) / 100 / 12;
      amortizationScheduleParams.monthsWithInitialRate = Number(
        presentratechangesafter
      );
      amortizationScheduleParams.monthsBetweenRateChanges =
        Number(ratecanchangeevery);
    }
    amortizationScheduleNoAdditionalPayment = this.#getAmortizationSchedule(
      amortizationScheduleParams
    );
    amortizationScheduleParams.additionalPaymentAmount =
      additionalPaymentAmount;
    amortizationSchedule = this.#getAmortizationSchedule(
      amortizationScheduleParams
    );
    const loanTermReduction = this.#monthsToYearsAndMonthsString(
      originalTermMonths - amortizationSchedule.length
    );
    const interestSavings =
      this.#sum(amortizationScheduleNoAdditionalPayment, 'interest') -
      this.#sum(amortizationSchedule, 'interest');

    results.loantermreduction = loanTermReduction;
    results.interestsavings = interestSavings;

    if (amortizationTableInterval !== 'No') {
      results.amortizationTable = this.#getAmortizationTableFromSchedule(
        amortizationSchedule,
        amortizationTableInterval
      );
    }

    if (!results.hasOwnProperty('amortizationTable')) {
      results.amortizationTable = [];
    }

    this.#onScroll();

    return results;
  }
  /**
   * Calculate the Rent vs Own
   * @returns {Object} results
   */

  calculateRentVsOwn() {
    const {
      annualhomeappreciation,
      annualhomemaintenance,
      annualrentincrease,
      downpayment,
      estimatedhomepurchasecosts,
      homepurchaseprice,
      howlongbeforeselling,
      interestearnedondownpayment,
      monthlyrent,
      monthlyrentersinsurance,
      mortgageinterestrate,
      propertytaxrate,
      sellingcosts,
      yourincometaxrate,
    } = this.#formData;

    const homePurchasePrice = Number(homepurchaseprice);
    const yearsBeforeSelling = Number(howlongbeforeselling);
    const monthsBeforeSelling = yearsBeforeSelling * 12;
    const monthlyHomeInsurance = (0.003 * homePurchasePrice) / 12;
    const annualHomeMaintenanceAmount =
      (Number(annualhomemaintenance) / 100) * homePurchasePrice;

    const loanAmount = homePurchasePrice - Number(downpayment);
    const loanToValueRatio = loanAmount / homePurchasePrice;
    const monthlyMortgageInsurance =
      loanAmount * this.#getInsurancePerLoanDollar(loanToValueRatio);
    const monthlyRate = Number(mortgageinterestrate) / 100 / 12;
    const termMonths = 360;
    const monthlyPayment = this.#getMonthlyPayment(
      monthlyRate,
      termMonths,
      loanAmount
    );
    const principalAndInterest = this.#getPrincipalAndInterestPaid(
      monthlyRate,
      loanAmount,
      monthlyPayment,
      0,
      monthsBeforeSelling
    );
    const propertyTaxRate = Number(propertytaxrate) / 100;
    const taxSaving =
      (((Number(estimatedhomepurchasecosts) / 100) * homePurchasePrice +
        propertyTaxRate * homePurchasePrice * yearsBeforeSelling +
        principalAndInterest.interestPaid) *
        Number(yourincometaxrate)) /
      100;
    const monthlyPropertyTaxes = (propertyTaxRate * homePurchasePrice) / 12;
    const monthlyRent = Number(monthlyrent);
    const monthlyRentersInsurance = Number(monthlyrentersinsurance);
    const rentInitialMonthlyPayment = monthlyRent + monthlyRentersInsurance;
    const ownInitialMonthlyPayment =
      monthlyPayment +
      monthlyPropertyTaxes +
      monthlyHomeInsurance +
      monthlyMortgageInsurance;
    const annualRentIncrease = Number(annualrentincrease) / 100;
    let rentTotal;
    if (annualRentIncrease !== 0) {
      rentTotal =
        (monthlyRent *
          12 *
          (Math.pow(1 + annualRentIncrease, yearsBeforeSelling) - 1)) /
          annualRentIncrease +
        monthlyRentersInsurance * monthsBeforeSelling;
    } else {
      rentTotal = rentInitialMonthlyPayment * monthsBeforeSelling;
    }
    const ownTotal =
      ownInitialMonthlyPayment * monthsBeforeSelling +
      annualHomeMaintenanceAmount * yearsBeforeSelling;
    const rentAvgMonthlyPayment = rentTotal / monthsBeforeSelling;
    const ownAvgMonthlyPayment = (ownTotal - taxSaving) / monthsBeforeSelling;
    var avgMonthlyPaymentDiff = rentAvgMonthlyPayment - ownAvgMonthlyPayment;

    const homeSellPrice =
      homePurchasePrice *
      Math.pow(1 + Number(annualhomeappreciation) / 100, yearsBeforeSelling);
    const homeSellCosts = (homeSellPrice * Number(sellingcosts)) / 100;
    const homeDownPaymentPlusClosingCosts =
      (Number(downpayment) +
        (Number(estimatedhomepurchasecosts) / 100) * homePurchasePrice) *
      Math.pow(
        1 + Number(interestearnedondownpayment) / 100 / 12,
        monthsBeforeSelling
      );
    const remainingLoanBalance =
      loanAmount - principalAndInterest.principalPaid;
    const ownInvestmentGain =
      homeSellPrice -
      homeSellCosts -
      remainingLoanBalance -
      homeDownPaymentPlusClosingCosts;
    const ownPaymentSavings = rentTotal - ownTotal + taxSaving;
    const ownTotalGain = ownInvestmentGain + ownPaymentSavings;
    const shouldYouRentOrOwn = ownTotalGain > 0 ? 'Own' : 'Rent';

    const paymentConsiderationRows = [
      { description: 'Initial Rent Payment', rent: monthlyRent, own: '-' },
      {
        description: "Renter's Insurance",
        rent: monthlyRentersInsurance,
        own: '-',
      },
      { description: 'Mortgage Payment', rent: '-', own: monthlyPayment },
      {
        description: 'PMI (Mortgage Insurance)',
        rent: '-',
        own: monthlyMortgageInsurance,
      },
      { description: 'Property Taxes', rent: '-', own: monthlyPropertyTaxes },
      {
        description: "Homeowner's Insurance",
        rent: '-',
        own: monthlyHomeInsurance,
      },
      {
        description: 'Before Tax Monthly Payment',
        rent: rentInitialMonthlyPayment,
        own: ownInitialMonthlyPayment,
      },
      {
        description: 'Annual Home Maintenance',
        rent: '-',
        own: annualHomeMaintenanceAmount,
      },
      {
        description: 'Total Payments Over ' + yearsBeforeSelling + ' Years',
        rent: rentTotal,
        own: ownTotal,
      },
      {
        description: 'Total Tax Savings Over ' + yearsBeforeSelling + ' Years',
        rent: '-',
        own: taxSaving,
      },
      {
        description: 'Average After Tax Monthly Payment',
        rent: rentAvgMonthlyPayment,
        own: ownAvgMonthlyPayment,
      },
    ];
    const paymentConsiderationsTable = {
      header: 'Payment Considerations',
      rowHeaders: [
        {
          title: 'Description',
          dataIndex: 'description',
          key: 'description',
        },
        {
          title: 'Rent',
          dataIndex: 'rent',
          key: 'rent',
        },
        {
          title: 'Own',
          dataIndex: 'own',
          key: 'own',
        },
      ],
      rows: this.#formatRentVsOwnRows(
        JSON.parse(JSON.stringify(paymentConsiderationRows))
      ),
    };
    const investmentConsiderationsRows = [
      { description: 'Estimated Home Selling Price', total: homeSellPrice },
      { description: 'Loan Balance', total: remainingLoanBalance },
      { description: 'Estimated Cost to Sell', total: homeSellCosts },
      {
        description:
          'Down Payment & Initial Closing Costs with Unearned Interest',
        total: homeDownPaymentPlusClosingCosts,
      },
      {
        description: 'Investment Gain of Owning vs. Renting',
        total: ownInvestmentGain,
      },
      {
        description: 'Total Payment Savings of Owning vs. Renting',
        total: ownPaymentSavings,
      },
      {
        description: 'Combined Gain of Owning vs. Renting',
        total: ownTotalGain,
      },
    ];
    const investmentConsiderationsTable = {
      header:
        'Investment Considerations After ' + yearsBeforeSelling + ' Years',
      rowHeaders: [
        {
          title: 'Description',
          dataIndex: 'description',
          key: 'description',
        },
        {
          title: 'Total',
          dataIndex: 'total',
          key: 'total',
        },
      ],
      rows: this.#formatRentVsOwnRows(
        JSON.parse(JSON.stringify(investmentConsiderationsRows))
      ),
    };

    this.#onScroll();

    return {
      shouldyourentorown: shouldYouRentOrOwn,
      averagemonthlypaymentsavings: {
        value: Math.round(avgMonthlyPaymentDiff * 100) / 100,
        label:
          'Average Monthly Payment Savings if ' + shouldYouRentOrOwn + 'ing',
      },
      estimatedtotalgain: {
        value: Math.round(Math.abs(ownTotalGain) * 100) / 100,
        label: 'Estimated Total Gain if ' + shouldYouRentOrOwn + 'ing',
      },
      fullReport: [paymentConsiderationsTable, investmentConsiderationsTable],
    };
  }

  /**
   * Calculates the Annual Percentage Rate (APR)
   * @returns {Object} results
   */
  calculateAPR() {
    const {
      interestrate,
      loanamount,
      loanterm,
      loantype,
      maxlifetimerateincrease,
      maxperiodicrateincrease,
      presentratechangesafter,
      ratecanchangeevery,
    } = this.#formData;

    const termMonths = Number(loanterm) * 12;

    const monthlyRate = Number(interestrate) / 100 / 12;

    const loanAmount = Number(loanamount);

    const closingCosts = this.#getClosingCosts(loanAmount, monthlyRate * 12);

    const beginningDate = this.#getDateForBeginningOfCurrentMonth();

    const initialMonthlyPayment = this.#getMonthlyPayment(
      monthlyRate,
      termMonths,
      loanAmount
    );

    const loanAmountWithClosingCosts = loanAmount + closingCosts;

    let aprMonthlyPayment = this.#getMonthlyPayment(
      monthlyRate,
      termMonths,
      loanAmountWithClosingCosts
    );

    if (loantype === 'Adjustable Rate') {
      let amortizationScheduleParams = {
        monthlyRate: monthlyRate,

        loanAmount: loanAmountWithClosingCosts,

        termMonths: termMonths,

        monthlyPayment: aprMonthlyPayment,

        beginningDate: beginningDate,

        maxPeriodicMonthlyRateIncrease:
          Number(maxperiodicrateincrease) / 100 / 12,

        maxLifetimeMonthlyRateIncrease:
          Number(maxlifetimerateincrease) / 100 / 12,

        monthsWithInitialRate: Number(presentratechangesafter),

        monthsBetweenRateChanges: Number(ratecanchangeevery),
      };

      const amortizationSchedule = this.#getAmortizationSchedule(
        amortizationScheduleParams
      );

      const totalMonthlyPayments = this.#sum(amortizationSchedule, 'payment');

      aprMonthlyPayment = this.#round(
        totalMonthlyPayments / amortizationSchedule.length
      );
    }

    let monthlyApr = monthlyRate;

    while (
      this.#getMonthlyPayment(monthlyApr, termMonths, loanAmount) <
      aprMonthlyPayment
    ) {
      monthlyApr += 0.001 / 100 / 12;
    }
    this.#onScroll();
    return {
      initialmonthlypayment: initialMonthlyPayment,
      APR: monthlyApr * 12 * 100,
    };
  }

  #getMonthlyPayment(monthlyRate, termMonths, loanAmount) {
    return this.#round(
      this.#getPercentageOfLoanAmountPerMonth(monthlyRate, termMonths) *
        loanAmount
    );
  }
  #getPercentageOfLoanAmountPerMonth(monthlyRate, termMonths) {
    if (termMonths <= 0) return 1;
    return monthlyRate / (1 - 1 / Math.pow(1 + monthlyRate, termMonths));
  }

  #round(num) {
    return Math.round((num + 0.00001) * 100) / 100;
  }

  #getDateForBeginningOfCurrentMonth() {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  #sum(items, prop) {
    return items.reduce((a, b) => {
      return a + b[prop];
    }, 0);
  }

  #getDateFromMonthAndYear(my) {
    const monthAndYear = my.split('/');
    const month = parseInt(monthAndYear[0], 10) - 1;
    const year = parseInt(monthAndYear[1], 10);
    return new Date(year, month, 1);
  }

  #getAmortizationSchedule(params) {
    let schedule = [];
    let adjustedBalance = params.loanAmount;
    let adjustedMonthlyRate = params.monthlyRate;
    let adjustedMonthlyPayment = params.monthlyPayment;
    let scheduleDate = new Date(
      JSON.parse(JSON.stringify(params.beginningDate))
    );
    let maxMonthlyRate;
    for (let i = 0; i < params.termMonths; i++) {
      schedule[i] = {
        timePeriod: this.#getMonthAndYearFromDate(scheduleDate),
        extraPayment: 0,
      };
      if (
        typeof params.monthsWithInitialRate === 'undefined' ||
        i < params.monthsWithInitialRate
      ) {
        // either fixed rate or before the month when adjustable rate can start adjusting
        schedule[i].payment = params.monthlyPayment;
        if (
          params.hasOwnProperty('additionalPaymentAmount') &&
          this.#isMonthToMakeAdditionalPayment(i, params)
        ) {
          schedule[i].extraPayment = params.additionalPaymentAmount;
        }
      } else {
        if (
          (i - params.monthsWithInitialRate) %
            params.monthsBetweenRateChanges ===
          0
        ) {
          // time to get a new rate if we aren't already at the max, which means a new monthly payment
          maxMonthlyRate =
            params.monthlyRate + params.maxLifetimeMonthlyRateIncrease;
          if (adjustedMonthlyRate < maxMonthlyRate) {
            adjustedMonthlyRate = Math.min(
              adjustedMonthlyRate + params.maxPeriodicMonthlyRateIncrease,
              maxMonthlyRate
            );
            adjustedMonthlyPayment = this.#getMonthlyPayment(
              adjustedMonthlyRate,
              params.termMonths - i,
              adjustedBalance
            );
          }
        }
        schedule[i].payment = adjustedMonthlyPayment;
        if (
          params.hasOwnProperty('additionalPaymentAmount') &&
          this.#isMonthToMakeAdditionalPayment(i, params)
        ) {
          schedule[i].extraPayment = params.additionalPaymentAmount;
        }
      }
      // reduce the balance by how much principal you are paying this much
      let payment = schedule[i].payment;
      payment += schedule[i].hasOwnProperty('extraPayment')
        ? schedule[i].extraPayment
        : 0;
      let principalAndInterest = this.#getPrincipalAndInterestPaid(
        adjustedMonthlyRate,
        adjustedBalance,
        payment,
        i,
        i + 1
      );
      schedule[i].principal = principalAndInterest.principalPaid;
      schedule[i].interest = principalAndInterest.interestPaid;
      adjustedBalance -= principalAndInterest.principalPaid;

      if (i === params.termMonths - 1 || adjustedBalance <= 0) {
        // on the last month, make sure you pay any balance remainder
        if (schedule[i].extraPayment === 0) {
          schedule[i].payment += adjustedBalance;
        } else {
          schedule[i].extraPayment += adjustedBalance;
        }
        schedule[i].principal += adjustedBalance;
        adjustedBalance = 0;
        schedule[i].balance = adjustedBalance;

        // regular payment is more than needed, so set regular payment to whatever is left and remove extra payment
        if (
          schedule[i].principal + schedule[i].interest <=
          schedule[i].payment
        ) {
          schedule[i].extraPayment = 0;
          schedule[i].payment = schedule[i].principal + schedule[i].interest;
        }
        break;
      }
      schedule[i].balance = adjustedBalance;
      scheduleDate.setMonth(scheduleDate.getMonth() + 1);
    }
    return schedule;
  }

  #getMonthAndYearFromDate(date) {
    let month = date.getMonth() + 1;
    month = month < 10 ? '0' + month : month;
    const year = date.getFullYear();
    return month + '/' + year;
  }

  #isMonthToMakeAdditionalPayment(month, params) {
    const today = new Date();
    const monthsUntilNextYear = 12 - today.getMonth();
    if (params.firstAdditionalPayment === 'Starting Next Month') {
      if (params.additionalPaymentAmountFrequency === 'Monthly') {
        return month > 0;
      }
      return month % 12 === 1;
    } else if (params.firstAdditionalPayment === 'Starting Next Year') {
      if (params.additionalPaymentAmountFrequency === 'Monthly') {
        return month >= monthsUntilNextYear;
      }
      return (
        month >= monthsUntilNextYear && (month - monthsUntilNextYear) % 12 === 0
      );
    } else if (params.firstAdditionalPayment === 'One Year From Now') {
      if (params.additionalPaymentAmountFrequency === 'Monthly') {
        return month >= 12;
      }
      return month >= 12 && month % 12 === 0;
    }
  }

  #getPrincipalAndInterestPaid(
    monthlyRate,
    totalAmount,
    monthlyPayment,
    monthStart,
    monthEnd
  ) {
    let interestPaid = 0;
    let principalPaid = 0;
    let interest = 0;
    let principal = 0;
    for (let i = monthStart; i < monthEnd; i++) {
      interest = this.#round(totalAmount * monthlyRate);
      principal = monthlyPayment - interest;
      totalAmount = totalAmount - principal;
      interestPaid = interestPaid + interest;
      principalPaid = principalPaid + principal;
    }

    return {
      principalPaid: principalPaid,
      interestPaid: interestPaid,
    };
  }

  #getAmortizationTableFromSchedule(schedule, interval) {
    let tables = [];
    let i;
    let yearSchedule;
    tables.push({
      header: 'Grand Total',
      totals: this.#getAmortizationTotals(schedule, true),
    });
    if (interval === 'Monthly') {
      for (i = 0; i < schedule.length; i += 12) {
        yearSchedule = JSON.parse(JSON.stringify(schedule.slice(i, i + 12)));
        tables.push({
          header: 'Monthly Amortization Schedule - Year ' + (i / 12 + 1),
          rows: this.#formatAmortizationRows(
            JSON.parse(JSON.stringify(yearSchedule))
          ),
          totals: this.#getAmortizationTotals(yearSchedule, true, true),
        });
      }
    } else if (interval === 'Yearly') {
      let yearlyRows = [];
      for (i = 0; i < schedule.length; i += 12) {
        yearSchedule = JSON.parse(JSON.stringify(schedule.slice(i, i + 12)));
        yearlyRows.push(this.#getAmortizationTotals(yearSchedule, false));
      }
      tables.push({
        header: 'Yearly Amortization Schedule',
        rows: this.#formatAmortizationRows(
          JSON.parse(JSON.stringify(yearlyRows))
        ),
      });
    }
    return tables;
  }
  #getAmortizationTotals(schedule, format, showYearlyTotal) {
    let payment = this.#sum(schedule, 'payment');
    let principal = this.#sum(schedule, 'principal');
    let interest = this.#sum(schedule, 'interest');
    let balance = schedule[schedule.length - 1].balance;
    let extraPayment = this.#sum(schedule, 'extraPayment');

    if (format) {
      payment = '$' + this.#formatNumbers(payment.toFixed(2), 2, true);
      principal = '$' + this.#formatNumbers(principal.toFixed(2), 2, true);
      interest = '$' + this.#formatNumbers(interest.toFixed(2), 2, true);
      balance = '$' + this.#formatNumbers(balance.toFixed(2), 2, true);
      extraPayment =
        '$' + this.#formatNumbers(extraPayment.toFixed(2), 2, true);
    }

    return {
      timePeriod: showYearlyTotal
        ? 'Total'
        : schedule[0].timePeriod +
          ' - ' +
          schedule[schedule.length - 1].timePeriod,
      payment: payment,
      principal: principal,
      interest: interest,
      balance: balance,
      extraPayment: extraPayment,
    };
  }

  #formatNumbers(amt, decimalNumbers, includeCommas, allowNegative) {
    let isNegative = allowNegative && amt.indexOf('-') === 0 ? '-' : '';
    amt = amt.replace(/[^0-9.]+/g, '');
    amt = amt.split('.');
    if (amt.length > 1) amt.splice(amt.length - 1, 0, '.');
    amt = amt.join('');
    let amts = amt.split('.');
    if (includeCommas) amts[0] = amts[0].replace(/\d(?=(?:\d{3})+$)/g, '$&,');
    if (amts.length > 1) amts[1] = amts[1].substring(0, decimalNumbers);
    return isNegative + amts.join('.');
  }
  #formatAmortizationRows(rows) {
    for (var i = 0; i < rows.length; i++) {
      rows[i].payment =
        '$' + this.#formatNumbers(rows[i].payment.toFixed(2), 2, true);
      rows[i].principal =
        '$' + this.#formatNumbers(rows[i].principal.toFixed(2), 2, true);
      rows[i].interest =
        '$' + this.#formatNumbers(rows[i].interest.toFixed(2), 2, true);
      rows[i].balance =
        '$' + this.#formatNumbers(rows[i].balance.toFixed(2), 2, true);
      rows[i].extraPayment =
        '$' + this.#formatNumbers(rows[i].extraPayment.toFixed(2), 2, true);
    }
    return rows;
  }
  #monthsToYearsAndMonthsString(totalMonths) {
    if (totalMonths <= 0) {
      return '0 Years, 0 Months';
    }
    let result = totalMonths / 12;
    let years = Math.floor(result);
    let months = totalMonths - years * 12;
    let yearString = years === 1 ? 'Year' : 'Years';
    let monthString = months === 1 ? 'Month' : 'Months';
    let resultString = years > 0 ? years + ' ' + yearString : '';
    resultString += years > 0 && months > 0 ? ', ' : '';
    resultString += months > 0 ? months + ' ' + monthString : '';
    return resultString;
  }

  #getInsurancePerLoanDollar(loanToValueRatio) {
    if (loanToValueRatio <= 0.8) return 0;
    if (loanToValueRatio <= 0.85) return 0.23 / 1200;
    if (loanToValueRatio <= 0.9) return 0.39 / 1200;
    if (loanToValueRatio <= 0.95) return 0.71 / 1200;
    if (loanToValueRatio <= 0.97) return 0.95 / 1200;

    return 0;
  }
  #formatRentVsOwnRows(rows) {
    let formattedValue;
    for (let i = 0; i < rows.length; i++) {
      if (typeof rows[i].rent === 'number') {
        formattedValue =
          '$' + this.#formatNumbers(rows[i].rent.toFixed(2), 2, true);
        rows[i].rent =
          rows[i].rent < 0 ? '(' + formattedValue + ')' : formattedValue;
      }
      if (typeof rows[i].own === 'number') {
        formattedValue =
          '$' + this.#formatNumbers(rows[i].own.toFixed(2), 2, true);
        rows[i].own =
          rows[i].own < 0 ? '(' + formattedValue + ')' : formattedValue;
      }
      if (typeof rows[i].total === 'number') {
        formattedValue =
          '$' + this.#formatNumbers(rows[i].total.toFixed(2), 2, true);
        rows[i].total =
          rows[i].total < 0 ? '(' + formattedValue + ')' : formattedValue;
      }
    }
    return rows;
  }
  #getClosingCosts(loanAmount, interestRate) {
    const {
      closingcosts,
      totalclosingcosts,
      pointstolender,
      loanoriginationfeetolender,
      pointstobroker,
      loanoriginationfeetobroker,
      yearlyprivatemortgageinsurance,
      lendersinspectionfee,
      taxservicefee,
      underwritingreviewfee,
      applicationfee,
      brokerprocessingfee,
      otherexclappraisaltitleescrowattorney,
    } = this.#formData;

    if (closingcosts === 'ENTER TOTAL CLOSING COSTS') {
      return Number(totalclosingcosts);
    }

    return (
      (Number(pointstolender) / 100) * loanAmount +
      Number(loanoriginationfeetolender) +
      (Number(pointstobroker) / 100) * loanAmount +
      Number(loanoriginationfeetobroker) +
      (Number(yearlyprivatemortgageinsurance) * 15) / 365 +
      Number(lendersinspectionfee) +
      Number(taxservicefee) +
      Number(underwritingreviewfee) +
      Number(applicationfee) +
      Number(brokerprocessingfee) +
      Number(otherexclappraisaltitleescrowattorney) +
      (loanAmount * interestRate * 15) / 365
    );
  }
  #onScroll() {
    const main = document.querySelector('main');
    if (main) {
      if (main.scrollHeight > main.clientHeight) {
        const isMobile =
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
          );
        const smallDeviceQuery = window.matchMedia('(max-width: 767px)');
        if (isMobile || smallDeviceQuery.matches) {
          setTimeout(() => {
            main.scrollTo({
              top: main.scrollHeight,
              behavior: 'smooth',
            });
          }, 0);
        } else {
          main.scrollTo({
            top: 0,
            behavior: 'smooth',
          });
        }
      }
    }
  }
}

export default Calculator;
