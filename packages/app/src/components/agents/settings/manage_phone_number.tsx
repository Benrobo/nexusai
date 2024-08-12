import {
  FlexColCenter,
  FlexColStart,
  FlexRowCenterBtw,
  FlexRowEnd,
  FlexRowEndCenter,
  FlexRowStart,
  FlexRowStartBtw,
  FlexRowStartCenter,
} from "@/components/Flex";
import {
  Cog,
  MailCheck,
  PhoneCall,
  PhoneFowarded,
  RefreshCcw,
  TextCursor,
  X,
} from "@/components/icons";
import { ChildLoader, FullPageLoader } from "@/components/Loader";
import Modal from "@/components/Modal";
import Button from "@/components/ui/button";
import {
  buyPhoneNumber,
  getAgentPhoneNumbers,
  getCheckoutUrl,
  getTwAvailableNumbers,
} from "@/http/requests";
import { cn, formatNumber } from "@/lib/utils";
import type { ResponseData } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import callForwardingCarriersCode from "@/data/call-forwarding";
import TooltipComp from "@/components/TooltipComp";

dayjs.extend(relativeTime);

interface Props {
  agent_id: string;
}

interface IActiveNumDetails {
  phone: string;
  country: string;
  subscription: {
    renews_at: string | null;
    ends_at: string;
    status: string;
    variant: string;
  };
}

interface ITwilioAvailableNumbers {
  friendlyName: string;
  phoneNumber: string;
  locality: string;
  rateCenter: string;
  latitude: string;
  longitude: string;
  region: string;
  postalCode: string;
  isoCountry: string;
  addressRequirements: string;
  beta: boolean;
  capabilities: {
    voice: boolean;
    SMS: boolean;
    MMS: boolean;
  };
}

const forwardingGuideTabs = [
  { name: "all_calls", title: "Forwarding All Calls (US)" },
  { name: "carrier_specific", title: "Carrier Specific Codes" },
];

const iphoneIcons = {
  settings: "/assets/icons/settings.svg",
  phone: "/assets/icons/phone.svg",
  switch: "/assets/icons/switch.png",
};

const androidIcons = {
  simcard: "/assets/icons/simcard.png",
};

type TabName = "all_calls" | "carrier_specific";
type DeviceType = "iphone" | "android";

export default function ManagePhoneNumber({ agent_id }: Props) {
  const [activeNumDetails, setActiveNumberDetails] =
    useState<IActiveNumDetails | null>(null);
  const [availableTwNumbes, setAvailableTwNumbers] = useState<
    ITwilioAvailableNumbers[]
  >([]);
  const [activeTab, setActiveTab] = useState<TabName>("all_calls");
  const [deviceType, setDeviceType] = useState<DeviceType>("iphone");
  const [setupOpen, setSetupOpen] = useState(false);
  const [buyPNLodingState, setBuyPNLoadingState] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCarrier, setSelectedCarrier] = useState<{
    carrier: string | null;
    condition: string | null;
    details: {
      name: string;
      activate: string;
      deactivate: string;
    } | null;
  }>({
    carrier: null,
    condition: null,
    details: null,
  });
  const [carrierConditions, setCarrierConditions] = useState<string[]>([]);
  const getAgentActiveNumMut = useMutation({
    mutationFn: async (id: string) => await getAgentPhoneNumbers(id),
    onSuccess: (data) => {
      const resp = data as ResponseData;
      setActiveNumberDetails(resp.data);
    },
    onError: (error) => {
      const err = (error as any).response.data as ResponseData;
      toast.error(err.message);
    },
  });
  const getTwAvailableNumMut = useMutation({
    mutationFn: async () => await getTwAvailableNumbers(),
    onSuccess: (data) => {
      const resp = data as ResponseData;
      setAvailableTwNumbers(resp.data);
    },
    onError: (error) => {
      const err = (error as any).response.data as ResponseData;
      toast.error(err.message);
    },
  });
  const buyPNMut = useMutation({
    mutationFn: async (data: any) => await buyPhoneNumber(data),
    onSuccess: () => {
      // call the next flow
      getCheckoutUrlMut.mutate();
    },
    onError: (error) => {
      const err = (error as any).response.data as ResponseData;
      toast.error(err.message);
      // clear loading state
      setBuyPNLoadingState([]);
    },
  });
  const getCheckoutUrlMut = useMutation({
    mutationFn: async () => await getCheckoutUrl(),
    onSuccess: (data) => {
      const resp = data as ResponseData;
      const url = resp.data.url;
      window.open(url, "_blank");
      // reset loading
      setBuyPNLoadingState([]);
    },
    onError: (error) => {
      const err = (error as any).response.data as ResponseData;
      toast.error(err.message);
    },
  });

  useEffect(() => {
    if (!agent_id) return;
    getAgentActiveNumMut.mutate(agent_id);
  }, [agent_id]);

  useEffect(() => {
    if (selectedCarrier.carrier) {
      const carrier =
        callForwardingCarriersCode.us_carrier_forwarding_codes.find(
          (cf) => String(cf.id) === String(selectedCarrier.carrier)
        );
      if (carrier) {
        setCarrierConditions(Object.keys(carrier.forwarding));
      }
    }
  }, [selectedCarrier.carrier]);

  useEffect(() => {
    if (selectedCarrier.carrier && selectedCarrier.condition) {
      const carrier =
        callForwardingCarriersCode.us_carrier_forwarding_codes.find(
          (cf) => String(cf.id) === String(selectedCarrier.carrier)
        );
      if (carrier) {
        // @ts-expect-error
        const details = carrier.forwarding[selectedCarrier.condition as string];
        setSelectedCarrier((prev) => ({
          ...prev,
          details: {
            name: carrier.carrier,
            activate: details.activate,
            deactivate: details.deactivate,
          },
        }));
      }
    }
  }, [selectedCarrier.carrier, selectedCarrier.condition]);

  return (
    <>
      <FlexColStart
        className={cn(
          "w-full h-auto transition-all px-0 py-4 rounded-md mt-5 relative"
          // "bg-red-305/5 border-[2px] border-red-305/20"
        )}
      >
        <FlexRowStartBtw className="w-full">
          <FlexColStart className="w-auto gap-0 px-4">
            <h1 className="text-lg font-jb font-bold text-dark-100">
              Active Number
            </h1>
            <span className="text-xs font-jb font-light text-white-400">
              Phone number assigned to this agent.
            </span>
          </FlexColStart>

          <FlexRowEnd className="w-auto">
            <button
              className="text-xs font-ppReg text-white-100 flex-center px-4 py-3 rounded-lg bg-dark-100 gap-3 enableBounceEffect"
              onClick={() => setSetupOpen(true)}
            >
              Setup
              <PhoneFowarded size={15} className="stroke-white-100" />
            </button>
          </FlexRowEnd>
        </FlexRowStartBtw>
        {getAgentActiveNumMut.isPending ? (
          <FullPageLoader fixed={false} />
        ) : (
          <FlexRowStartBtw
            className={cn(
              "w-full h-auto transition-all mt-4 px-4 py-4 rounded-md relative",
              !activeNumDetails
                ? "bg-red-305/5 border-[2px] border-red-305/20"
                : "bg-white-300"
            )}
          >
            {false && (
              <span className="absolute left-[20em] top-2 rounded-full px-3 py-[3px] bg-dark-100 text-[10px] font-jb font-normal text-white-100 scale-[.80]">
                Renews on June 1, 2022
              </span>
            )}
            <FlexColStart className="w-full gap-0 relative">
              <h1
                className={cn(
                  "text-lg font-jb text-dark-100",
                  activeNumDetails ? "font-extrabold" : "font-normal"
                )}
              >
                {activeNumDetails
                  ? formatNumber(activeNumDetails?.phone)
                  : "+1 (N/A) N/A-N/A"}
              </h1>

              {/* renew message */}
              {activeNumDetails && (
                <span className="text-[10px] absolute top-1 left-[25em] bg-dark-100 font-jb font-normal text-white-100 px-2 py-[1px] scale-[.90] rounded-full">
                  renew on{" "}
                  {dayjs(activeNumDetails?.subscription.renews_at).format(
                    "MMM DD YYYY"
                  )}
                </span>
              )}

              <FlexRowStartCenter className="w-full">
                <span className="text-xs font-jb font-bold text-white-400">
                  {activeNumDetails?.subscription.variant ?? "N/A"}
                </span>
                <span className="text-md -translate-y-1 font-jb font-light text-dark-100">
                  .
                </span>
                <span className="text-xs font-jb font-light text-white-400">
                  🇺🇸
                </span>
              </FlexRowStartCenter>
              <span className="text-[10px] font-jb font-light text-white-40 mt-2">
                {!activeNumDetails
                  ? "Please purchase a number to activate this agent."
                  : "Forward unknown calls to this number."}
              </span>
            </FlexColStart>
            {!activeNumDetails && (
              <Button
                intent={"dark"}
                className="w-[140px] h-[36px] px-4 text-[10px] font-ppReg drop-shadow disabled:bg-dark-100/70 disabled:text-white-100"
                onClick={() => {
                  setModalOpen(true);
                  getTwAvailableNumMut.mutate();
                }}
                enableBounceEffect={true}
                disabled={getTwAvailableNumMut.isPending}
              >
                <PhoneCall size={15} />
                Buy Number
              </Button>
            )}
          </FlexRowStartBtw>
        )}
      </FlexColStart>

      <Modal
        isOpen={setupOpen}
        onClose={() => {
          setSelectedCarrier({
            carrier: null,
            condition: null,
            details: null,
          });
          setActiveTab("all_calls");
          setSetupOpen(false);
          setDeviceType("iphone");
        }}
        fixed={false}
        isBlurBg
      >
        <FlexColStart className="w-full min-w-[600px] h-full bg-white-300 rounded-[22px] p-1">
          <FlexColStart className="w-full bg-white-100 rounded-[20px] relative">
            <button
              className="w-[30px] h-[30px] rounded-full border-none outline-none flex flex-col items-center justify-center absolute top-3 right-3 bg-white-400/20 scale-[.85] active:scale-[.95] transition-all"
              onClick={() => {
                setSetupOpen(false);
                setSelectedCarrier({
                  carrier: null,
                  condition: null,
                  details: null,
                });
                setActiveTab("all_calls");
                setDeviceType("iphone");
              }}
            >
              <X size={15} color="#000" />
            </button>

            <FlexRowStart className="w-full px-4 py-5 border-b-[1px] border-dashed border-b-white-400/20 ">
              <FlexColCenter className="w-auto border-[2px] bg-dark-100 rounded-full p-1 relative">
                <PhoneCall size={20} className="stroke-white-100 p-1" />
              </FlexColCenter>

              <FlexColStart className="w-full gap-1">
                <h1 className="font-ppM font-bold text-lg">
                  Setup Call Forwarding
                </h1>
                <p className="text-xs font-ppReg font-light text-gray-500">
                  A guide to setting up call forwarding for this agent.
                </p>
              </FlexColStart>
            </FlexRowStart>

            <FlexColStart className="w-full h-auto px-5 pb-5 mt-3 relative max-h-[600px] overflow-auto">
              <FlexRowStartCenter>
                {forwardingGuideTabs.map((tab) => (
                  <button
                    key={tab.name}
                    className={cn(
                      "w-auto px-3 py-2 rounded-full text-xs font-ppReg enableBounceEffect",
                      activeTab === tab.name
                        ? "bg-white-300 text-dark-100 border-[.5px] border-white-400/30 font-ppM"
                        : "bg-transparent text-white-400"
                    )}
                    onClick={() => setActiveTab(tab.name as TabName)}
                  >
                    {tab.title}
                  </button>
                ))}
              </FlexRowStartCenter>

              {/* all calls section */}
              {activeTab === "all_calls" && (
                <FlexColStart className="w-full mt-5 px-3">
                  <FlexRowEndCenter className="w-full">
                    {["iphone", "android"].map((d) => (
                      <button
                        className={cn(
                          "w-auto px-3 py-1 rounded-md text-xs font-ppReg enableBounceEffect",
                          d === "iphone" && deviceType === "iphone"
                            ? "bg-dark-100 text-white-100"
                            : d === "android" && deviceType === "android"
                              ? "bg-green-100 text-white-100"
                              : "bg-white-300 text-dark-100 border-[.5px] border-white-400/30 font-ppM"
                        )}
                        onClick={() => setDeviceType(d as DeviceType)}
                      >
                        {d === "iphone" ? "iPhone" : "Android"}
                      </button>
                    ))}
                  </FlexRowEndCenter>

                  {/* instructions */}
                  <FlexColStart className="w-full gap-1">
                    <h1 className="text-md font-ppReg text-dark-100">
                      For {deviceType === "iphone" ? "iPhone" : "Android"} users
                    </h1>
                    <p className="text-xs font-ppReg text-white-400">
                      To forward all incoming calls.
                    </p>

                    {deviceType === "iphone" ? (
                      <FlexColStart className="w-auto mt-3 gap-10">
                        <FlexRowStartCenter className="w-full relative before:content-[''] before:absolute before:-bottom-6 before:left-3 before:w-[1.5px] before:h-[15px] before:bg-white-400/40">
                          <img src={iphoneIcons.settings} width={30} />
                          <span className="text-sm font-ppReg text-white-400 ml-2">
                            Go to your phone{" "}
                            <span className="font-ppM text-dark-100">
                              Settings
                            </span>
                          </span>
                        </FlexRowStartCenter>

                        <FlexRowStartCenter className="w-full relative before:content-[''] before:absolute before:-bottom-6 before:left-3 before:w-[1.5px] before:h-[15px] before:bg-white-400/40">
                          <img src={iphoneIcons.phone} width={30} />
                          <span className="text-sm font-ppReg text-white-400 ml-2">
                            Scroll down to{" "}
                            <span className="font-ppM text-dark-100">
                              Phone
                            </span>
                          </span>
                        </FlexRowStartCenter>

                        <FlexRowStartCenter className="w-full relative before:content-[''] before:absolute before:-bottom-5 before:left-3 before:w-[1.5px] before:h-[15px] before:bg-white-400/40 -translate-y-2">
                          <img src={iphoneIcons.switch} width={45} />
                          <span className="text-sm font-ppReg text-white-400 ml-2">
                            Sellect{" "}
                            <span className="font-ppM text-dark-100">
                              Call Forwarding
                            </span>{" "}
                            and turn it on.
                          </span>
                        </FlexRowStartCenter>

                        <FlexRowStartCenter className="w-full relative -translate-y-2">
                          <TextCursor size={25} className="stroke-brown-102" />
                          <span className="text-sm font-ppReg text-white-400 ml-2">
                            Type in the number you just purchased.{" "}
                            <span className="font-ppM text-dark-100">
                              {activeNumDetails?.phone ?? ""}
                            </span>
                          </span>
                        </FlexRowStartCenter>
                      </FlexColStart>
                    ) : (
                      <FlexColStart className="w-auto mt-3 gap-10">
                        <FlexRowStartCenter className="w-full relative before:content-[''] before:absolute before:-bottom-6 before:left-3 before:w-[1.5px] before:h-[15px] before:bg-white-400/40">
                          <img src={iphoneIcons.phone} width={30} />
                          <span className="text-sm font-ppReg text-white-400 ml-2">
                            Go to your{" "}
                            <span className="font-ppM text-dark-100">
                              Phone
                            </span>{" "}
                            app
                          </span>
                        </FlexRowStartCenter>

                        <FlexRowStartCenter className="w-full relative before:content-[''] before:absolute before:-bottom-6 before:left-3 before:w-[1.5px] before:h-[15px] before:bg-white-400/40">
                          <Cog size={25} className="stroke-brown-102" />
                          <span className="text-sm font-ppReg text-white-400 ml-2">
                            Go to your phone{" "}
                            <span className="font-ppM text-dark-100">
                              Settings
                            </span>{" "}
                            (located in the top right corner)
                          </span>
                        </FlexRowStartCenter>

                        <FlexRowStartCenter className="w-full relative before:content-[''] before:absolute before:-bottom-5 before:left-3 before:w-[1.5px] before:h-[15px] before:bg-white-400/40 -translate-y-2">
                          <img
                            src={androidIcons.simcard}
                            width={30}
                            className="-translate-x-0"
                          />
                          <span className="text-sm font-ppReg text-white-400 ml-2">
                            Sellect{" "}
                            <span className="font-ppM text-dark-100">
                              SIM card settings
                            </span>{" "}
                            and select carrier features. Select Call forwarding.
                          </span>
                        </FlexRowStartCenter>

                        <FlexRowStartCenter className="w-full relative -translate-y-2">
                          <TextCursor size={25} className="stroke-brown-102" />
                          <span className="text-sm font-ppReg text-white-400 ml-2">
                            Type in the number you just purchased.{" "}
                            <span className="font-ppM text-dark-100">
                              {activeNumDetails?.phone ?? ""}
                            </span>
                          </span>
                        </FlexRowStartCenter>
                      </FlexColStart>
                    )}
                  </FlexColStart>
                </FlexColStart>
              )}

              {activeTab === "carrier_specific" && (
                <FlexColStart className="w-full mt-5 px-3">
                  <FlexRowCenterBtw className="w-auto gap-10">
                    <select
                      className="w-auto px-3 py-1 rounded-md bg-white-300 border-[.5px] border-white-400/30 font-ppReg text-[12px] focus:border-white-400 focus:outline-none"
                      onChange={(e) => {
                        setSelectedCarrier((prev) => ({
                          ...prev,
                          carrier: e.target.value,
                        }));
                      }}
                    >
                      <option value="">Select Carrier Provider</option>
                      {callForwardingCarriersCode.us_carrier_forwarding_codes.map(
                        (cf) => (
                          <option key={cf.id} value={cf.id}>
                            {cf.carrier}
                          </option>
                        )
                      )}
                    </select>

                    <select
                      className="w-auto px-3 py-1 rounded-md bg-white-300 border-[.5px] border-white-400/30 font-ppReg text-[12px] focus:border-white-400 focus:outline-none disabled:opacity-[.5] disabled:cursor-not-allowed"
                      disabled={!selectedCarrier.carrier}
                      onChange={(e) => {
                        setSelectedCarrier((prev) => ({
                          ...prev,
                          condition: e.target.value,
                        }));
                      }}
                    >
                      <option value="">Select Condition</option>
                      {selectedCarrier?.carrier !== null &&
                      carrierConditions.length > 0 ? (
                        carrierConditions.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))
                      ) : (
                        <option value="">No conditions</option>
                      )}
                    </select>
                  </FlexRowCenterBtw>

                  <FlexColStart className="w-full">
                    {selectedCarrier.carrier && selectedCarrier.condition && (
                      <FlexColStart className="w-full gap-3 mt-5">
                        <h1 className="text-md font-ppB text-dark-100">
                          {selectedCarrier.details?.name}
                        </h1>
                        <p className="text-sm font-ppReg text-white-400">
                          <span className="text-dark-100 font-ppM">
                            Activate
                          </span>{" "}
                          To activate call forwarding
                          <span className="px-1 py-1 ml-1 text-dark-100 bg-white-300 border-[.5px] border-white-400/30 rounded-md">
                            {selectedCarrier.condition === "all_calls"
                              ? "on " + selectedCarrier.condition
                              : selectedCarrier.condition}
                          </span>{" "}
                          dial the following code
                          <span className="px-1 py-1 text-md font-jb font-extrabold ml-1 text-dark-100 rounded-md">
                            {selectedCarrier.details?.activate?.replace(
                              "<number>",
                              activeNumDetails?.phone ?? "<number>"
                            )}
                          </span>
                          <br />
                          <br />
                          <span className="text-dark-100 font-ppM">
                            Deactivate
                          </span>{" "}
                          To deactivate call forwarding{" "}
                          <span className="px-1 py-1 font-jb text-md font-extrabold text-md ml-1 text-dark-100 rounded-md">
                            {selectedCarrier.details?.deactivate}
                          </span>
                        </p>
                      </FlexColStart>
                    )}
                  </FlexColStart>
                </FlexColStart>
              )}
            </FlexColStart>
          </FlexColStart>
        </FlexColStart>
      </Modal>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        fixed={true}
        isBlurBg
      >
        <FlexColStart className="w-full min-w-[600px] h-full bg-white-300 rounded-[22px] p-1">
          <FlexColStart className="w-full bg-white-100 rounded-[20px] relative">
            <button
              className="w-[30px] h-[30px] rounded-full border-none outline-none flex flex-col items-center justify-center absolute top-3 right-3 bg-white-400/20 scale-[.85] active:scale-[.95] transition-all"
              onClick={() => {
                setModalOpen(false);
                getTwAvailableNumMut.reset();
              }}
            >
              <X size={15} color="#000" />
            </button>
            <button
              className={cn(
                "w-[30px] h-[30px] border-none outline-none flex flex-col items-center justify-center bg-dark-100 disabled:bg-dark-100/70 disabled:text-white-100 scale-[.85] absolute top-3 right-12 rounded-full"
              )}
              disabled={getTwAvailableNumMut.isPending}
              onClick={() => getTwAvailableNumMut.mutate()}
            >
              <RefreshCcw size={12} />
            </button>

            <FlexRowStart className="w-full px-4 py-5 border-b-[1px] border-dashed border-b-white-400/20 ">
              <FlexColCenter className="w-auto border-[2px] bg-dark-100 rounded-full p-1 relative">
                <PhoneCall size={20} className="stroke-white-100 p-1" />
              </FlexColCenter>

              <FlexColStart className="w-full gap-1">
                <h1 className="font-ppM font-bold text-lg">Buy Phone Number</h1>
                <p className="text-xs font-ppReg font-light text-gray-500">
                  Purchase a new phone number for this agent.{" "}
                  <TooltipComp
                    text={`Funds used in purchasing a number are eligible for refund after the testing phase concludes.\n Please reach out to alumonabenaiah71@gmail.com.`}
                  >
                    <span className="text-xs font-ppM font-light text-dark-100 underline">
                      For Judges
                    </span>
                  </TooltipComp>
                </p>
              </FlexColStart>
            </FlexRowStart>

            <FlexColStart className="w-full h-auto px-5 pb-5 mt-3 relative max-h-[400px] overflow-auto">
              {getTwAvailableNumMut.isPending ? (
                <ChildLoader />
              ) : availableTwNumbes.length > 0 ? (
                availableTwNumbes.map((twn, idx) => (
                  <FlexRowStartBtw className="w-full gap-5" key={idx}>
                    <FlexColStart className="gap-1">
                      <h1 className="text-sm font-jb font-bold text-dark-100">
                        {formatNumber(twn?.phoneNumber)}
                      </h1>
                      <span className="text-xs text-white-400 font-jb font-normal">
                        {twn.locality}, {twn.isoCountry}
                      </span>
                    </FlexColStart>

                    <FlexRowStartCenter className="w-auto gap-4">
                      <span className="text-sm font-jb font-bold">$1.15</span>
                    </FlexRowStartCenter>

                    <FlexRowStartCenter className="w-auto gap-4">
                      <PhoneCall size={15} className="stroke-white-400" />
                      <MailCheck size={15} className="stroke-white-400" />
                    </FlexRowStartCenter>

                    <Button
                      intent={"dark"}
                      className="w-[130px] h-[36px] px-4 text-xs font-ppReg drop-shadow disabled:bg-dark-100/70 disabled:text-white-100 scale-[.90]"
                      disabled={
                        buyPNMut.isPending || getCheckoutUrlMut.isPending
                      }
                      onClick={() => {
                        setBuyPNLoadingState((prev: any) => [
                          ...prev,
                          twn.phoneNumber,
                        ]);
                        buyPNMut.mutate({
                          agent_id,
                          phone_number: twn.phoneNumber,
                        });
                      }}
                      enableBounceEffect={true}
                      isLoading={buyPNLodingState.includes(twn.phoneNumber)}
                    >
                      <PhoneCall size={15} />
                      Buy Number
                    </Button>
                  </FlexRowStartBtw>
                ))
              ) : null}

              {!getTwAvailableNumMut.isPending &&
                availableTwNumbes.length === 0 && (
                  <span className="text-sm font-jb font-norma text-white-400/30">
                    No available numbers to purchase. Try again later.
                  </span>
                )}
            </FlexColStart>
          </FlexColStart>
        </FlexColStart>
      </Modal>
    </>
  );
}
