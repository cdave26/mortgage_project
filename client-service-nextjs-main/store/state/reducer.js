import { STATES } from "./type";

const initialize = {
  states: {
    loading: false,
    data: [],
  },
  statesPerCompany: {
    loading: false,
    data: [],
  },
  metaData: [
    {
      name: "Arizona",
      validation: [
        {
          name: "Mortgage (Banker or Broker)",
          key: "banker_broker",
          selection: [
            { full_title: "Banker", value: "Banker", checked: false },
            { full_title: "Broker", value: "Broker", checked: false },
          ],
        },
        {
          name: "Branch Address",
          key: "branch_address",
          selection: [
            {
              full_title: "Address",
              value: "",
            },
            {
              full_title: "City",
              value: "",
            },
            {
              full_title: "Zip",
              value: "",
            },
          ],
        },
      ],
      disclaimer: "",
    },
    {
      name: "Arkansas",
      validation: [
        {
          name: "Mortgage (Banker or Broker, and Servicer)",
          key: "banker_broker_servicer",
          selection: [
            { full_title: "Banker", value: "Banker", checked: false },
            { full_title: "Broker", value: "Broker", checked: false },
            {
              full_title: "Banker, Broker, and Servicer",
              value: "Banker, Broker, and Servicer",
              checked: false,
            },
          ],
        },
        {
          name: "Branch Address",
          key: "branch_address",
          selection: [
            {
              full_title: "Address",
              value: "",
            },
            {
              full_title: "City",
              value: "",
            },
            {
              full_title: "Zip",
              value: "",
            },
          ],
        },
      ],
      disclaimer: "",
    },
    {
      name: "California",
      validation: [
        {
          name: "Licensed by the California Department of",
          key: "california_options",
          selection: [
            {
              full_title:
                "Financial Protection and Innovation under the California Financing Law",
              value: "Financial california law",
              checked: false,
            },
            {
              full_title:
                "Financial Protection and Innovation under the California Residential Mortgage Lending Act",
              value: "Mortgage lending act",
              checked: false,
            },
            {
              full_title: "Real Estate under the Department of Real Estate",
              value: "Dept real estate",
              checked: false,
            },
          ],
        },
      ],
      disclaimer: "",
    },
    {
      name: "Connecticut",
      validation: [
        {
          name: "Mortgage (Lender or Broker)",
          key: "lender_broker",
          selection: [
            {
              full_title: "Lender",
              value: "Lender",
              checked: false,
            },
            {
              full_title: "Broker",
              value: "Broker",
              checked: false,
            },
          ],
        },
      ],
      disclaimer: "",
    },
    {
      name: "Delaware",
      validation: [
        {
          name: "Mortgage (Lender or Broker)",
          key: "lender_broker",
          selection: [
            {
              full_title: "Lender",
              value: "Lender",
              checked: false,
            },
            {
              full_title: "Broker",
              value: "Broker",
              checked: false,
            },
          ],
        },
      ],
      disclaimer: "",
    },
    {
      name: "Georgia",
      validation: [
        {
          name: "Mortgage (Lender or Broker)",
          key: "lender_broker",
          selection: [
            {
              full_title: "Lender",
              value: "Lender",
              checked: false,
            },
            {
              full_title: "Broker",
              value: "Broker",
              checked: false,
            },
          ],
        },
        {
          name: "Licensee or Registrant",
          key: "licensee_registrant",
          selection: [
            {
              full_title: "Licensee",
              value: "Licensee",
              checked: false,
            },
            {
              full_title: "Registrant",
              value: "Registrant",
              checked: false,
            },
          ],
        },
        {
          name: "Branch Address",
          key: "branch_address",
          selection: [
            {
              full_title: "Address",
              value: "",
            },
            {
              full_title: "City",
              value: "",
            },
            {
              full_title: "Zip",
              value: "",
            },
          ],
        },
      ],
      disclaimer: "",
    },
    {
      name: "Massachusetts",
      validation: [
        {
          name: "Mortgage (Lender or Broker)",
          key: "lender_broker",
          selection: [
            {
              full_title: "Lender",
              value: "Lender",
              checked: false,
            },
            {
              full_title: "Broker",
              value: "Broker",
              checked: false,
            },
          ],
        },
      ],
      disclaimer: "",
    },
    {
      name: "Montana",
      validation: [
        {
          name: "Mortgage (Lender or Broker)",
          key: "lender_broker",
          selection: [
            {
              full_title: "Lender",
              value: "Lender",
              checked: false,
            },
            {
              full_title: "Broker",
              value: "Broker",
              checked: false,
            },
          ],
        },
      ],
      disclaimer: "",
    },
    {
      name: "Nebraska",
      validation: [
        {
          name: "Licensee or Registrant",
          key: "licensee_registrant",
          selection: [
            {
              full_title: "Licensee",
              value: "Licensee",
              checked: false,
            },
            {
              full_title: "Registrant",
              value: "Registrant",
              checked: false,
            },
          ],
        },
      ],
      disclaimer: "",
    },
    {
      name: "Nevada",
      validation: [
        {
          name: "Branch Address",
          key: "branch_address",
          selection: [
            {
              full_title: "Address",
              value: "",
            },
            {
              full_title: "City",
              value: "",
            },
            {
              full_title: "Zip",
              value: "",
            },
          ],
        },
      ],
      disclaimer: "",
    },
    {
      name: "New Jersey",
      validation: [
        {
          name: "Mortgage (Lender or Broker or Depository)",
          key: "lender_broker_depository",
          selection: [
            {
              full_title: "Residential Mortgage Lender",
              value: "Residential Mortgage Lender",
              checked: false,
            },
            {
              full_title: "Residential Mortgage Broker",
              value: "Residential Mortgage Broker",
              checked: false,
            },
            {
              full_title: "Registered Depository",
              value: "Registered Depository",
              checked: false,
            },
          ],
        },
        {
          name: "Licensee or Registrant",
          key: "licensee_registrant",
          selection: [
            {
              full_title: "Licensee",
              value: "Licensee",
              checked: false,
            },
            {
              full_title: "Registrant",
              value: "Registrant",
            },
          ],
        },
      ],
      disclaimer: "",
    },
    {
      name: "New York",
      validation: [
        {
          name: "Mortgage (Banker or Broker)",
          key: "banker_broker",
          selection: [
            {
              full_title: "Banker",
              value: "Banker",
              checked: false,
            },
            {
              full_title: "Broker",
              value: "Broker",
              checked: false,
            },
          ],
        },
        {
          name: "Licensee or Registrant",
          key: "licensee_registrant",
          selection: [
            {
              full_title: "Licensee",
              value: "Licensee",
              checked: false,
            },
            {
              full_title: "Registrant",
              value: "Registrant",
              checked: false,
            },
          ],
        },
      ],
      disclaimer: "",
    },
    {
      name: "Ohio",
      validation: [
        {
          name: "Branch Address",
          key: "branch_address",
          selection: [
            {
              full_title: "Address",
              value: "",
            },
            {
              full_title: "City",
              value: "",
            },
            {
              full_title: "Zip",
              value: "",
            },
          ],
        },
      ],
      disclaimer: "",
    },
    {
      name: "Rhode Island",
      validation: [
        {
          name: "Mortgage (Lender or Broker)",
          key: "lender_broker",
          selection: [
            {
              full_title: "Lender",
              value: "Lender",
              checked: false,
            },
            {
              full_title: "Broker",
              value: "Broker",
              checked: false,
            },
          ],
        },
      ],
      disclaimer: "",
    },
    {
      name: "South Carolina",
      validation: [
        {
          name: "Mortgage (Lender or Supervised Lender or Broker)",
          key: "servicer_lender_broker",
          selection: [
            {
              full_title: "Mortgage Lender/Servicer",
              value: "Mortgage Lender/Servicer",
              checked: false,
            },
            {
              full_title: "Supervised Lender Company",
              value: "Supervised Lender Company",
              checked: false,
            },
            {
              full_title: "Mortgage Broker",
              value: "Mortgage Broker",
              checked: false,
            },
          ],
        },
      ],
      disclaimer: "",
    },
    {
      name: "Texas",
      validation: [
        {
          name: "Licensee or Registrant",
          key: "licensee_registrant",
          selection: [
            {
              full_title: "Licensee",
              value: "Licensee",
              checked: false,
            },
            {
              full_title: "Registrant",
              value: "Registrant",
              checked: false,
            },
          ],
        },
      ],
      disclaimer: "",
    },

    {
      name: "Vermont",
      validation: [
        {
          name: "Mortgage (Lender or Broker)",
          key: "lender_broker",
          selection: [
            {
              full_title: "Lender",
              value: "Lender",
              checked: false,
            },
            {
              full_title: "Broker",
              value: "Broker",
              checked: false,
            },
          ],
        },
        {
          name: "Branch Address",
          key: "branch_address",
          selection: [
            {
              full_title: "Address",
              value: "",
            },
            {
              full_title: "City",
              value: "",
            },
            {
              full_title: "Zip",
              value: "",
            },
          ],
        },
      ],
      disclaimer: "",
    },
    {
      name: "Virginia",
      validation: [
        {
          name: "Mortgage (Lender or Broker)",
          key: "lender_broker",
          selection: [
            {
              full_title: "Lender",
              value: "Lender",
              checked: false,
            },
            {
              full_title: "Broker",
              value: "Broker",
              checked: false,
            },
          ],
        },
      ],
      disclaimer: "",
    },
    {
      name: "Wisconsin",
      validation: [
        {
          name: "Mortgage (Banker or Broker)",
          key: "banker_broker",
          selection: [
            {
              full_title: "Banker",
              value: "Banker",
              checked: false,
            },
            {
              full_title: "Broker",
              value: "Broker",
              checked: false,
            },
          ],
        },
      ],
      disclaimer: "",
    },
  ],
};

const licenseStates = (state = initialize, action) => {
  switch (action.type) {
    case STATES.GET_STATES:
      return {
        ...state,
        states: {
          ...state.states,
          loading: action.payload.loading,
          data: action.payload.data,
        },
      };
    case STATES.GET_STATES_PER_COMPANY:
      return {
        ...state,
        statesPerCompany: {
          ...state.statesPerCompany,
          loading: action.payload.loading,
          data: action.payload.data,
        },
      };
    case STATES.SELECTED_STATE:
      return {
        ...state,
        states: {
          ...state.states,
          data: state.states.data.map((item) => {
            if (item.value === action.payload.value) {
              item = {
                ...item,
                laseSelected: action.payload.laseSelected,
                id: action.payload.id,
                metadata: action.payload.metadata,
                selected: true,
              };
            } else {
              if (item.value === action.payload.laseSelected) {
                item = {
                  ...item,
                  selected: false,
                  metadata: null,
                  id: null,
                };
              }
            }

            return item;
          }),
        },
      };
    case STATES.RESET_SELECTED_STATE:
      return {
        ...state,
        states: {
          ...state.states,
          data: state.states.data.map((item) => {
            return {
              ...item,
              selected: false,
              metadata: null,
              id: null,
            };
          }),
        },
      };
    case STATES.UPDATE_SET_INITIAL_STATE_META_DATA:
      return {
        ...state,
        states: {
          ...state.states,
          data: state.states.data.map((item) => {
            if (action.payload.length > 0) {
              action.payload.map((update) => {
                if (item.value === update.value) {
                  item = {
                    ...item,
                    metadata: update.metadata,
                    selected: update.selected,
                    id: update.id,
                    laseSelected: update.laseSelected,
                  };
                }
              });
            }

            return item;
          }),
        },
      };
    case STATES.ON_CHECK_CHANGE:
      return {
        ...state,
        states: {
          ...state.states,
          data: state.states.data.map((item) => {
            if (item.key === action.payload.key) {
              if (item.metadata) {
                return {
                  ...item,
                  metadata: {
                    ...item.metadata,
                    validation: item.metadata.validation.map((vv) => {
                      if (
                        item.value.replace(/^[A-Z]{2}\s-\s/, "") ===
                        "California"
                      ) {
                        return {
                          ...vv,
                          selection: vv.selection.map((ss) => {
                            return {
                              ...ss,
                              checked:
                                ss.value === action.payload.value
                                  ? action.payload.checked
                                  : ss.checked,
                            };
                          }),
                        };
                      } else {
                        return {
                          ...vv,
                          selection:
                            vv.name === action.payload.name
                              ? vv.selection.map((ss) => {
                                  return {
                                    ...ss,
                                    checked:
                                      ss.value === action.payload.value
                                        ? action.payload.checked
                                        : false,
                                  };
                                })
                              : vv.selection,
                        };
                      }
                    }),
                  },
                };
              }
            }
            return item;
          }),
        },
      };
    case STATES.ON_INPUT_CHANGE:
      return {
        ...state,
        states: {
          ...state.states,
          data: state.states.data.map((item) => {
            if (item.key === action.payload.key) {
              if (item.metadata) {
                return {
                  ...item,
                  metadata: {
                    ...item.metadata,
                    validation: item.metadata.validation.map((vv) => {
                      return {
                        ...vv,
                        selection:
                          vv.name === action.payload.name
                            ? vv.selection.map((ss) => {
                                return {
                                  ...ss,
                                  value:
                                    action.payload.add === ss.full_title
                                      ? action.payload.value
                                      : ss.value,
                                };
                              })
                            : vv.selection,
                      };
                    }),
                  },
                };
              }
            }

            return item;
          }),
        },
      };

    case STATES.ON_REMOVE_TO_DOM:
      return {
        ...state,
        states: {
          ...state.states,
          data: state.states.data.map((item) => {
            if (item.value === action.payload.value) {
              item = {
                ...item,
                laseSelected: null,
                id: null,
                metadata: null,
                selected: false,
              };
            }

            return item;
          }),
        },
      };
    default:
      return state;
  }
};

export default licenseStates;
