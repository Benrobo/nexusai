import {
  FlexColCenter,
  FlexColStart,
  FlexRowEndCenter,
  FlexRowStart,
  FlexRowStartBtw,
  FlexRowStartCenter,
} from "@/components/Flex";
import { Brain, Trash, UnPlug, X } from "@/components/icons";
import { ChildLoader } from "@/components/Loader";
import Modal from "@/components/Modal";
import TooltipComp from "@/components/TooltipComp";
import Button from "@/components/ui/button";
import {
  deleteKnowledgeBase,
  getAllKnowledgeBase,
  linkKnowledgeBase,
} from "@/http/requests";
import { cn } from "@/lib/utils";
import type { ResponseData } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface ILinkKnowledgeBaseProps {
  closeModal: () => void;
  refetch: () => void;
  agentId: string;
}

interface IAvailableKb {
  id: string;
  type: string;
  title: string;
  status: string;
  linked_kb: {
    agentId: string;
    kb_id: string;
    name: string;
  }[];
}

export default function LinkKnowledgeBase({
  closeModal,
  refetch,
  agentId,
}: ILinkKnowledgeBaseProps) {
  const [availableKb, setAvailableKb] = useState<IAvailableKb[]>([]);
  const [selectedKb, setSelectedKb] = useState<string[]>([]); // to be linked
  const getAvailableKbMut = useMutation({
    mutationFn: async () => await getAllKnowledgeBase(),
    onSuccess: (data: any) => {
      const resp = data as ResponseData;
      const _data = resp.data;
      setAvailableKb(_data);
    },
    onError: (error) => {
      console.log(error);
      toast.error("Error fetching knowledge base");
    },
  });
  const [toBeDeleted, setToBeDeleted] = useState<string[]>([]); // to be deleted
  const linkKbMut = useMutation({
    mutationFn: async (data: any) => await linkKnowledgeBase(data),
    onSuccess: (data: any) => {
      const resp = data as ResponseData;
      toast.success(resp.message);
      refetch();
      closeModal();
    },
    onError: (error: any) => {
      const err = error.response.data as ResponseData;
      const msg = err.message ?? "An error occurred";
      toast.error(msg);
      console.log(error);
    },
  });

  useEffect(() => {
    if (!agentId) {
      toast.error("Agent identity is missing.");
      return;
    }
    getAvailableKbMut.mutate();
  }, [agentId]);

  return (
    <Modal
      isOpen={true}
      onClose={() => closeModal()}
      isBlurBg
      fixed={false}
      className=""
    >
      <FlexColStart className="w-full max-h-[600px] min-w-[400px] h-full bg-white-300 rounded-[22px] p-1">
        <FlexColStart className="w-full h-auto bg-white-100 rounded-[20px] relative">
          <button
            className="w-[30px] h-[30px] rounded-full border-none outline-none flex flex-col items-center justify-center absolute top-3 right-3 bg-white-400/20 scale-[.85] active:scale-[.95] transition-all"
            onClick={() => {
              closeModal();
              getAvailableKbMut.reset();
              setSelectedKb([]);
            }}
          >
            <X size={15} color="#000" />
          </button>

          <FlexRowStart className="w-full px-4 py-5 border-b-[1px] border-dashed border-b-white-400/20 ">
            <FlexColCenter className="w-auto border-[2px] bg-dark-100 rounded-full p-1 relative">
              <Brain size={20} className="stroke-white-100 p-1" />
            </FlexColCenter>

            <FlexColStart className="w-full gap-1">
              <h1 className="font-ppM font-bold text-lg">Link Data Source</h1>
              <p className="text-xs font-ppReg font-light text-gray-500">
                Link other data source added by other agents to your knowledge.
              </p>
            </FlexColStart>
          </FlexRowStart>

          <FlexColStart className="w-full h-full max-h-[400px] mt-4 transition-all overflow-y-scroll hideScrollBar px-3 gap-0">
            {getAvailableKbMut.isPending ? (
              <ChildLoader />
            ) : !getAvailableKbMut.isPending && availableKb.length > 0 ? (
              availableKb.map((kb, i) => (
                <FlexRowStartBtw
                  key={kb.id}
                  className={cn(
                    "w-full px-6  py-4 hover:bg-white-400/10 transition-all",
                    i === 0
                      ? "rounded-tl-md rounded-tr-md border-b-[.5px] border-b-white-400/50"
                      : "",
                    i === availableKb.length - 1
                      ? "rounded-bl-md rounded-br-md"
                      : "",
                    selectedKb.includes(kb.id) && "bg-white-300/30"
                  )}
                >
                  <FlexRowStartCenter className="w-full">
                    <input
                      type="checkbox"
                      className="w-4 h-4 border border-white-400/20 rounded-md"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedKb([...selectedKb, kb.id]);
                        } else {
                          setSelectedKb(selectedKb.filter((k) => k !== kb.id));
                        }
                      }}
                    />
                    <FlexRowStart className="w-full gap-1">
                      <h1 className="font-jb text-xs font-md">
                        {kb?.title.length > 20
                          ? `${kb?.title.slice(0, 20)}...`
                          : kb?.title}
                      </h1>
                      <span className="px-2 py-[3px] rounded-mdn bg-dark-100 text-[10px] text-white-100 rounded-md scale-[.90] ml-2">
                        {kb?.type}
                      </span>
                    </FlexRowStart>

                    <FlexRowEndCenter className="w-full gap-2">
                      <TooltipComp
                        text={
                          kb?.linked_kb?.length > 0
                            ? `In use: [${kb.linked_kb.map((k) => k.name).join(",")}]`
                            : "In use: 0"
                        }
                      >
                        <FlexRowStartCenter className="w-auto">
                          <UnPlug size={15} className="stroke-white-400" />
                          <span className="w-[20px] h-[20px] text-[10px] flex flex-col items-center justify-center rounded-full border-[1px] border-dashed border-white-400">
                            {kb?.linked_kb.length}
                          </span>
                        </FlexRowStartCenter>
                      </TooltipComp>

                      <button
                        className="active:scale-[1.1] scale-[.95] transition-all"
                        onClick={() => {
                          const confirm = window.confirm(
                            kb.linked_kb.length > 0
                              ? `Are you sure you want to delete this knowledge base? There are ${kb.linked_kb.length} agents linked to this data source(s).`
                              : `Are you sure you want to delete this knowledge base?`
                          );

                          if (!confirm) return;

                          setToBeDeleted([...toBeDeleted, kb.id]);

                          toast.promise(
                            deleteKnowledgeBase({
                              kb_id: kb.id,
                              agent_id: agentId,
                            }),
                            {
                              loading: "Deleting...",
                              success: () => {
                                setToBeDeleted(
                                  toBeDeleted.filter((k) => k !== kb.id)
                                );
                                getAvailableKbMut.mutate();
                                return "Knowledge base deleted";
                              },
                              error: () => {
                                setToBeDeleted(
                                  toBeDeleted.filter((k) => k !== kb.id)
                                );
                                return "Error deleting knowledge base";
                              },
                            },
                            {
                              position: "top-right",
                            }
                          );
                        }}
                        disabled={toBeDeleted.includes(kb.id)}
                      >
                        <Trash size={15} className="stroke-red-305" />
                      </button>
                    </FlexRowEndCenter>
                  </FlexRowStartCenter>
                </FlexRowStartBtw>
              ))
            ) : (
              <FlexColCenter className="w-full h-full gap-1">
                <h1 className="font-jb font-bold text-sm">No data source</h1>
                <p className="text-xs font-jb font-light text-gray-500">
                  No data source available to link.
                </p>
              </FlexColCenter>
            )}

            <br />
            <FlexColCenter className="w-full mt-5 gap-1 px-4">
              <Button
                intent={"dark"}
                className="w-full px-4 text-[10px] font-ppReg drop-shadow disabled:bg-dark-100/30 disabled:text-white-100 rounded-2xl"
                onClick={() => {
                  linkKbMut.mutate({
                    agent_id: agentId,
                    kb_ids: selectedKb,
                  });
                }}
                enableBounceEffect={true}
                disabled={selectedKb.length === 0 || linkKbMut.isPending}
                isLoading={linkKbMut.isPending}
              >
                Link Data Source
              </Button>

              <br />
            </FlexColCenter>
          </FlexColStart>
        </FlexColStart>
      </FlexColStart>
    </Modal>
  );
}
