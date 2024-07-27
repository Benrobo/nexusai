import {
  FlexColCenter,
  FlexColStart,
  FlexRowEnd,
  FlexRowStart,
  FlexRowStartBtw,
  FlexRowStartCenter,
} from "@/components/Flex";
import { Cable, Info, Url, X } from "@/components/icons";
import Modal from "@/components/Modal";
import { Spinner } from "@/components/Spinner";
import TooltipComp from "@/components/TooltipComp";
import supportedIntegrations, {
  type ValidIntegrations,
} from "@/data/integration";
import { addIntegration } from "@/http/requests";
import { cn } from "@/lib/utils";
import type { ResponseData } from "@/types";
import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import toast from "react-hot-toast";

type Props = {
  agent_id: string;
  closeModal: () => void;
  integrations: {
    type: string;
    url: string;
    id: string;
  }[];
};

export default function AddIntegration({
  agent_id,
  closeModal,
  integrations,
}: Props) {
  const [step, setStep] = React.useState(1);
  const [selectedIntegration, setSelectedIntegration] =
    useState<ValidIntegrations | null>(null);
  const [showHowtoVideo, setShowHowtoVideo] = useState<boolean>(false);
  const [intUrl, setIntUrl] = useState<string>("");
  const addIntegrationMut = useMutation({
    mutationFn: async (data: any) => addIntegration(data),
    onSuccess: () => {
      closeModal();
      addIntegrationMut.reset();
      toast.success("Integration added successfully");
    },
    onError: (error) => {
      const err = (error as any).response.data as ResponseData;
      toast.error(err.message);
    },
  });

  const howtoVideo = supportedIntegrations.find(
    (int) => int.name === selectedIntegration
  )?.howto_video;

  const addIntegrationHandler = () => {
    if (!intUrl && selectedIntegration === "google_calendar")
      return toast.error("Please enter the booking page link");

    const payload = {
      agent_id,
      type: selectedIntegration,
    } as { [key: string]: string };

    if (selectedIntegration === "google_calendar") {
      payload["url"] = intUrl;
    }

    addIntegrationMut.mutate(payload);
  };

  return (
    <>
      <Modal
        isOpen={true}
        //   onClose={() => closeModal()}
        isBlurBg
        fixed={false}
        className=""
      >
        <FlexColStart className="w-full max-h-[600px] min-w-[550px] h-full bg-white-300 rounded-[22px] p-1">
          <FlexColStart className="w-full h-auto bg-white-100 rounded-[20px] relative">
            <button
              className="w-[30px] h-[30px] rounded-full border-none outline-none flex flex-col items-center justify-center absolute top-3 right-3 bg-white-400/20 scale-[.85] active:scale-[.95] transition-all"
              onClick={() => {
                closeModal();
                addIntegrationMut.reset();
              }}
            >
              <X size={15} color="#000" />
            </button>

            <FlexRowStart className="w-full px-4 py-5 border-b-[1px] border-dashed border-b-white-400/20 ">
              <FlexColCenter className="w-auto border-[2px] bg-dark-100 rounded-full p-1 relative">
                <Cable size={20} className="stroke-white-100 p-1" />
              </FlexColCenter>

              <FlexColStart className="w-full gap-1">
                <h1 className="font-ppM font-bold text-lg">Add Integration</h1>
                <p className="text-xs font-ppReg font-light text-gray-500">
                  Connect your agent with other tools to improve productivity.
                </p>
              </FlexColStart>
            </FlexRowStart>

            {/* integration cards */}
            {step === 1 && (
              <FlexRowStart className="w-full h-full p-4 gap-4">
                {supportedIntegrations.map((int, idx) => (
                  <button
                    className="w-full disabled:cursor-not-allowed disabled:opacity-50"
                    key={idx}
                    onClick={() => {
                      if (selectedIntegration === int.name) {
                        setSelectedIntegration(null);
                        return;
                      }
                      setSelectedIntegration(int.name);
                    }}
                    disabled={integrations
                      .map((int) => int.type)
                      .includes(int.name)}
                  >
                    <FlexColStart
                      className={cn(
                        "w-full max-w-[250px] h- bg-white-100 rounded-md px-4 py-2 border-2",
                        selectedIntegration === int.name
                          ? "border-dark-100"
                          : "border-white-400/30 "
                      )}
                      key={idx}
                    >
                      <FlexRowStartCenter className="w-full gap-1">
                        <img src={int.logo} width={40} />
                        <p className="text-sm font-ppM font-bold">
                          {int.displayName}
                        </p>
                      </FlexRowStartCenter>
                      <p className="text-[10px] font-ppReg text-gray-500 text-start">
                        {int.description}
                      </p>
                    </FlexColStart>
                  </button>
                ))}
              </FlexRowStart>
            )}

            {/* integration settings */}
            {step === 2 && (
              <FlexColStart className="w-full">
                {
                  <FlexColStart className="w-full px-5 py-2">
                    <FlexRowStartBtw className="w-full">
                      <label className="text-xs font-ppM font-semibold text-white-400">
                        Booking page link
                      </label>

                      <TooltipComp text="Watch video tutorial">
                        <button onClick={() => setShowHowtoVideo(true)}>
                          <Info size={15} className="stroke-dark-100" />
                        </button>
                      </TooltipComp>
                    </FlexRowStartBtw>
                    <FlexRowStart className="w-full h-[40px] gap-0 bg-white-300/50 border-2 border-dark-100 outline-none rounded-xl overflow-hidden">
                      <button className="w-full max-w-[50px] h-full bg-dark-100 rounded-tl-lg rounded-bl-lg flex items-center justify-center">
                        <Url size={20} className="stroke-white-100" />
                      </button>
                      <input
                        placeholder="https://calendar.app.google/d98AjWCTr1KBYQjr5"
                        className="w-full h-full px-3 font-ppM text-xs bg-transparent outline-none border-none placeholder:text-white-400/50 text-dark-100"
                        value={intUrl}
                        onChange={(e) => setIntUrl(e.target.value)}
                      />
                    </FlexRowStart>
                    {/* <Input
                    
                  /> */}
                  </FlexColStart>
                }
              </FlexColStart>
            )}

            {/* next page */}
            <FlexRowEnd className="w-full px-4 py-3">
              {step > 1 && (
                <button
                  className="w-auto px-4 py-2 rounded-md bg-dark-100 text-white-100 font-ppReg text-xs"
                  onClick={() => {
                    setStep(step - 1);
                  }}
                  disabled={addIntegrationMut.isPending}
                >
                  Prev
                </button>
              )}

              <button
                className="w-auto px-4 py-2 rounded-md bg-dark-100 text-white-100 font-ppReg text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  if (!selectedIntegration) return;
                  if (step > 1 || selectedIntegration === "telegram") {
                    addIntegrationHandler();
                    return;
                  }
                  setStep(step + 1);
                }}
                disabled={
                  !selectedIntegration ||
                  (step === 2 && !intUrl) ||
                  addIntegrationMut.isPending
                }
              >
                {step === 1 && selectedIntegration !== "telegram" ? (
                  "Next"
                ) : addIntegrationMut.isPending ? (
                  <Spinner size={15} color="#fff" />
                ) : (
                  "Add Integration"
                )}
              </button>
            </FlexRowEnd>
          </FlexColStart>
        </FlexColStart>
      </Modal>

      {/* Integration work through video */}
      <Modal
        isOpen={showHowtoVideo}
        onClose={() => setShowHowtoVideo(false)}
        isBlurBg
        fixed={false}
      >
        <FlexColStart className="w-full max-h-[600px] min-w-[500px] h-full bg-white-100 rounded-[22px] p-2">
          <button
            className="w-[30px] h-[30px] rounded-full border-none outline-none flex flex-col items-center justify-center absolute top-3 right-3 bg-white-400/20 scale-[.85] active:scale-[.95] transition-all"
            onClick={() => {
              setShowHowtoVideo(false);
            }}
          >
            <X size={15} color="#000" />
          </button>

          <FlexRowStart className="w-full px-4 py-5 border-b-[1px] border-dashed border-b-white-400/20 ">
            <FlexColCenter className="w-auto border-[2px] bg-dark-100 rounded-full p-1 relative">
              <Cable size={20} className="stroke-white-100 p-1" />
            </FlexColCenter>

            <FlexColStart className="w-full gap-1">
              <h1 className="font-ppM font-bold text-lg">
                How to create a booking page
              </h1>
            </FlexColStart>
          </FlexRowStart>

          {howtoVideo ? (
            <div className="w-full h-full overflow-hidden rounded-md">
              <video
                src={howtoVideo}
                className="w-full h-[400px] object-cover object-center bg-dark-100 rounded-md"
                controls
              ></video>
            </div>
          ) : (
            <FlexColCenter className="w-full h-[300px]">
              <p className="text-dark-100 text-sm font-ppM">No video found</p>
            </FlexColCenter>
          )}
        </FlexColStart>
      </Modal>
    </>
  );
}
