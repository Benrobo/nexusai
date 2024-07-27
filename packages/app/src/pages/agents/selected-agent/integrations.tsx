import AddIntegration from "@/components/agents/integration/add-integration";
import {
  FlexColCenter,
  FlexColStart,
  FlexColStartBtw,
  FlexRowEnd,
  FlexRowStart,
  FlexRowStartBtw,
  FlexRowStartCenter,
} from "@/components/Flex";
import { Cable, Cog, Trash } from "@/components/icons";
import Button from "@/components/ui/button";
import { deleteIntegration, getIntegration } from "@/http/requests";
import type { ResponseData } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import supportedIntegrations, {
  type ValidIntegrations,
} from "@/data/integration";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/Spinner";
import IntegrationConfig from "@/components/agents/integration/configuration";

type Integration = {
  type: string;
  url: string;
  id: string;
};

export default function Integrations() {
  const [addIntegration, setAddIntegration] = useState(false);
  const params = useParams();
  const agentId = params.id;
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [selectedIntegration, setSelectedIntegration] = useState<{
    agent_id: string;
    int_id: string;
    type: ValidIntegrations;
  } | null>(null);
  const getIntegrationQuery = useMutation({
    mutationFn: async (data: string) => await getIntegration(data!),
    onSuccess: (data) => {
      const resp = data as ResponseData;
      console.log(resp);
      setIntegrations(resp.data);
    },
    onError: (error) => {
      const err = (error as any).response.data as ResponseData;
      toast.error(err.message);
    },
  });
  const deleteIntMut = useMutation({
    mutationFn: async (data: { agent_id: string; int_id: string }) =>
      await deleteIntegration(data.agent_id!, data.int_id!),
    onSuccess: () => {
      getIntegrationQuery.mutate(agentId!);
    },
    onError: (error) => {
      const err = (error as any).response.data as ResponseData;
      toast.error(err.message);
    },
  });

  useEffect(() => {
    if (agentId) getIntegrationQuery.mutate(agentId!);
  }, [agentId]);

  return (
    <div className="w-full max-w-[100%] h-full px-10 py-10 overflow-y-scroll pb-[50em] hideScrollBar2 relative">
      <FlexColStart className="w-full h-full">
        <FlexRowStartBtw className="w-full py-7 border-b-[.3px] border-b-white-400/50">
          <FlexColStart className="gap-0 w-full">
            <h1 className="text-2xl font-jb font-extrabold text-dark-100">
              Integrations
            </h1>
            <p className="text-sm font-jb text-white-400 mt-1">
              Connect your agent with other tools to improve productivity.
            </p>
          </FlexColStart>

          <Button
            intent={"dark"}
            className="w-[180px] h-[36px] px-4 text-xs font-ppReg drop-shadow disabled:bg-dark-100/70 disabled:text-white-100"
            disabled={getIntegrationQuery.isPending}
            onClick={() => setAddIntegration(true)}
            enableBounceEffect={true}
          >
            <Cable size={15} className="stroke-white-100" /> Add Integration
          </Button>
        </FlexRowStartBtw>

        {/* integrations */}
        <FlexRowStart className="w-full gap-5 mt-5">
          {getIntegrationQuery.isPending ? (
            <FlexColCenter className="w-full h-full">
              <Spinner color="#000" size={25} />
            </FlexColCenter>
          ) : !getIntegrationQuery.isPending && integrations.length > 0 ? (
            integrations.map((int, idx) => {
              const supported = supportedIntegrations.find(
                (i) => i.name === int.type
              );
              return (
                <FlexColStartBtw
                  className={cn(
                    "w-full max-w-[350px] h-[120px] bg-white-100 rounded-md px-4 py-4 border-2",
                    "border-white-400/30 "
                  )}
                  key={idx}
                >
                  <FlexRowStartBtw className="w-full">
                    <FlexRowStartCenter className="w-full">
                      <img src={supported?.logo} width={40} />
                      <p className="text-sm font-ppM font-bold">
                        {supported?.displayName}
                      </p>
                    </FlexRowStartCenter>
                    <FlexRowEnd className="w-auto">
                      {supported?.name === "telegram" && (
                        <button
                          className="w-[30px] h-[30px] bg-dark-100 disabled:cursor-not-allowed disabled:opacity-[.5] enableBounceEffect rounded-sm flex-center"
                          onClick={() => {
                            setSelectedIntegration({
                              agent_id: agentId!,
                              int_id: int.id,
                              type: supported?.name as ValidIntegrations,
                            });
                          }}
                        >
                          <Cog size={15} className="stroke-white-100" />
                        </button>
                      )}
                      <button
                        className="w-[30px] h-[30px] disabled:cursor-not-allowed disabled:opacity-50 bg-red-305 rounded-sm enableBounceEffect flex-center"
                        onClick={() => {
                          const confirm = window.confirm(
                            "Are you sure you want to delete this integration?"
                          );
                          if (!confirm) return;
                          deleteIntMut.mutate({
                            agent_id: agentId!,
                            int_id: int.id,
                          });
                        }}
                        disabled={deleteIntMut.isPending}
                      >
                        <Trash size={20} className="stroke-white-100 " />
                      </button>
                    </FlexRowEnd>
                  </FlexRowStartBtw>
                  <p className="text-[13px] font-ppReg text-gray-500 text-start">
                    {supported?.description}
                  </p>
                </FlexColStartBtw>
              );
            })
          ) : (
            !getIntegrationQuery.isPending && (
              <FlexColCenter className="w-full h-full min-h-[100px]">
                <Cable className="stroke-dark-100" size={25} />
                <p className="text-white-400 font-ppM text-xs">
                  Add your first integration
                </p>
              </FlexColCenter>
            )
          )}
        </FlexRowStart>

        {/* integration configurtions */}
        {selectedIntegration && (
          <IntegrationConfig
            closeModal={() => setSelectedIntegration(null)}
            isOpen={selectedIntegration ? true : false}
            selectedIntegration={selectedIntegration}
          />
        )}

        {/* integration modal */}
        {addIntegration && (
          <AddIntegration
            agent_id={agentId!}
            closeModal={() => {
              setAddIntegration(false);
              getIntegrationQuery.mutate(agentId!);
            }}
            integrations={integrations}
          />
        )}
      </FlexColStart>
    </div>
  );
}
