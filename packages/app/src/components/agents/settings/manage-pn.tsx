import {
  FlexColCenter,
  FlexColStart,
  FlexRowEnd,
  FlexRowStart,
  FlexRowStartBtw,
  FlexRowStartCenter,
} from "@/components/Flex";
import { MailCheck, PhoneCall, RefreshCcw, X } from "@/components/icons";
import { ChildLoader, FullPageLoader } from "@/components/Loader";
import Modal from "@/components/Modal";
import Button from "@/components/ui/button";
import { getAgentPhoneNumbers, getTwAvailableNumbers } from "@/http/requests";
import { cn, formatNumber } from "@/lib/utils";
import type { ResponseData } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

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

export default function ManagePhoneNumber({ agent_id }: Props) {
  const [activeNumDetails, setActiveNumberDetails] =
    useState<IActiveNumDetails | null>(null);
  const [availableTwNumbes, setAvailableTwNumbers] = useState<
    ITwilioAvailableNumbers[]
  >([]);
  const [modalOpen, setModalOpen] = useState(false);
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

  useEffect(() => {
    if (!agent_id) return;
    getAgentActiveNumMut.mutate(agent_id);
  }, [agent_id]);

  return (
    <FlexColStart
      className={cn(
        "w-full h-auto transition-all px-0 py-4 rounded-md mt-5 relative"
        // "bg-red-305/5 border-[2px] border-red-305/20"
      )}
    >
      <FlexColStart className="w-auto gap-0 px-4">
        <h1 className="text-lg font-jb font-bold text-dark-100">
          Active Number
        </h1>
        <span className="text-xs font-jb font-light text-white-400">
          Phone number assigned to this agent.
        </span>
      </FlexColStart>
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
          <FlexColStart className="w-auto gap-0 relative">
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

            <FlexRowStartCenter className="w-auto">
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
              className="w-[130px] h-[36px] px-4 text-xs font-ppReg drop-shadow disabled:bg-dark-100/70 disabled:text-white-100"
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
                  Purchase a new phone number for this agent.
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
                      <PhoneCall size={15} className="stroke-white-400" />
                      <MailCheck size={15} className="stroke-white-400" />
                    </FlexRowStartCenter>

                    <Button
                      intent={"dark"}
                      className="w-[130px] h-[36px] px-4 text-xs font-ppReg drop-shadow disabled:bg-dark-100/70 disabled:text-white-100 scale-[.90]"
                      // disabled={enableSaveChangesButton()}
                      // onClick={saveChanges}
                      enableBounceEffect={true}
                      // isLoading={updateAgentSettingsMut.isPending || tabLoading}
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
    </FlexColStart>
  );
}
