type CallForwardingCarrierCode = {
  us_carrier_forwarding_codes: {
    id: any;
    carrier: string;
    forwarding: {
      all_calls: {
        activate: string;
        deactivate: string;
      };
      when_busy: {
        activate: string;
        deactivate: string;
      };
      when_unanswered: {
        activate: string;
        deactivate: string;
      };
      when_unreachable: {
        activate: string;
        deactivate: string;
      };
    };
  }[];
};

const callForwardingCarriersCode = {
  us_carrier_forwarding_codes: [
    {
      id: 1,
      carrier: "AT&T",
      forwarding: {
        all_calls: {
          activate: "*72",
          deactivate: "*73",
        },
        when_busy: {
          activate: "*67*<number>#",
          deactivate: "#67#",
        },
        when_unanswered: {
          activate: "*61*<number>#",
          deactivate: "#61#",
        },
        when_unreachable: {
          activate: "*62*<number>#",
          deactivate: "#62#",
        },
      },
    },
    {
      id: 2,
      carrier: "Verizon",
      forwarding: {
        all_calls: {
          activate: "*72",
          deactivate: "*73",
        },
        when_busy: {
          activate: "*90*<number>#",
          deactivate: "*91",
        },
        when_unanswered: {
          activate: "*92*<number>#",
          deactivate: "*93",
        },
        when_unreachable: {
          activate: "*92*<number>#",
          deactivate: "*900",
        },
      },
    },
    {
      id: 3,
      carrier: "T-Mobile",
      forwarding: {
        all_calls: {
          activate: "*72",
          deactivate: "*73",
        },
        when_busy: {
          activate: "**67*<number>#",
          deactivate: "##67#",
        },
        when_unanswered: {
          activate: "**61*<number>#",
          deactivate: "##61#",
        },
        when_unreachable: {
          activate: "**62*<number>#",
          deactivate: "##62#",
        },
      },
    },
    {
      id: 4,
      carrier: "Sprint",
      forwarding: {
        all_calls: {
          activate: "*72",
          deactivate: "*720",
        },
        when_busy: {
          activate: "**67*<number>#",
          deactivate: "##67#",
        },
        when_unanswered: {
          activate: "**61*<number>#",
          deactivate: "##61#",
        },
        when_unreachable: {
          activate: "**62*<number>#",
          deactivate: "##62#",
        },
      },
    },
    {
      id: 5,
      carrier: "US Cellular",
      forwarding: {
        all_calls: {
          activate: "*72",
          deactivate: "*73",
        },
        when_busy: {
          activate: "**67*<number>#",
          deactivate: "##67#",
        },
        when_unanswered: {
          activate: "**61*<number>#",
          deactivate: "##61#",
        },
        when_unreachable: {
          activate: "**62*<number>#",
          deactivate: "##62#",
        },
      },
    },
    {
      id: 7,
      carrier: "Xfinity Mobile",
      forwarding: {
        all_calls: {
          activate: "*72",
          deactivate: "*73",
        },
        when_busy: {
          activate: "**67*<number>#",
          deactivate: "##67#",
        },
        when_unanswered: {
          activate: "**61*<number>#",
          deactivate: "##61#",
        },
        when_unreachable: {
          activate: "**62*<number>#",
          deactivate: "##62#",
        },
      },
    },
    {
      id: 8,
      carrier: "Boost Mobile",
      forwarding: {
        all_calls: {
          activate: "*72",
          deactivate: "*720",
        },
        when_busy: {
          activate: "**67*<number>#",
          deactivate: "##67#",
        },
        when_unanswered: {
          activate: "**61*<number>#",
          deactivate: "##61#",
        },
        when_unreachable: {
          activate: "**62*<number>#",
          deactivate: "##62#",
        },
      },
    },
    {
      id: 9,
      carrier: "Cricket Wireless",
      forwarding: {
        all_calls: {
          activate: "*72",
          deactivate: "*73",
        },
        when_busy: {
          activate: "**67*<number>#",
          deactivate: "##67#",
        },
        when_unanswered: {
          activate: "**61*<number>#",
          deactivate: "##61#",
        },
        when_unreachable: {
          activate: "**62*<number>#",
          deactivate: "##62#",
        },
      },
    },
    {
      id: 10,
      carrier: "Metro by T-Mobile",
      forwarding: {
        all_calls: {
          activate: "*72",
          deactivate: "*73",
        },
        when_busy: {
          activate: "**67*<number>#",
          deactivate: "##67#",
        },
        when_unanswered: {
          activate: "**61*<number>#",
          deactivate: "##61#",
        },
        when_unreachable: {
          activate: "**62*<number>#",
          deactivate: "##62#",
        },
      },
    },
  ],
} satisfies CallForwardingCarrierCode;

export default callForwardingCarriersCode;
