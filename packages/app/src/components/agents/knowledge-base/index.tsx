import {
  FlexColStart,
  FlexRowCenter,
  FlexRowEnd,
  FlexRowStart,
  FlexRowStartBtw,
  FlexRowStartCenter,
} from "@/components/Flex";
import {
  Brain,
  Cable,
  Library,
  Pen,
  Play,
  Plus,
  Trash,
} from "@/components/icons";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TooltipComp from "@/components/TooltipComp";
import type { KBType, ResponseData } from "@/types";
import Button from "@/components/ui/button";
import AddKnowledgeBaseModal from "./addKb";
import { useQuery } from "@tanstack/react-query";
import { getKnowledgeBase } from "@/http/requests";
import toast from "react-hot-toast";
import { useLocation } from "react-router-dom";
import { ChildLoader } from "@/components/Loader";

// Knowledgebase Tab

const tableHeader = [
  {
    title: "Data",
    includeCheckbox: true,
  },
  {
    title: "Type",
  },
  {
    title: "Status",
  },
  {
    title: "Action",
    align: "right",
  },
];

type ActiveModal = "add-kb" | "link-kb";

type KBData = {
  id: string;
  kb_id: string;
  type: KBType;
  title: string;
  created_at: Date;
  agent_id: string;
  status: string;
};

export default function KnowledgeBase() {
  const [activeModal, setActiveModal] = useState<ActiveModal | null>(null);
  const [tabLoading, setTabLoading] = useState(true);
  const location = useLocation();
  const pathname = location.pathname.split("/");
  const agentId = pathname[pathname.length - 1];
  const [kb, setKb] = useState<KBData[]>([]);
  const getKbQuery = useQuery({
    queryKey: ["knowledge-base"],
    queryFn: async () => await getKnowledgeBase(agentId),
    enabled: agentId && agentId.length > 0 ? true : false,
  });

  useEffect(() => {
    if (getKbQuery.error) {
      const resp = getKbQuery.error;
      const msg = resp.message ?? "An error occurred";
      toast.error(msg);
      setTabLoading(false);
    }
    if (getKbQuery.data) {
      const data = getKbQuery.data as ResponseData;
      setKb(data.data);
      setTabLoading(false);
    }
  }, [getKbQuery]);

  return (
    <div className="w-full max-w-[100%] h-full px-10 py-10 relative">
      <FlexColStart className="w-full h-full relative ">
        <FlexRowStartBtw className="w-full px-3">
          <FlexColStart className="gap-0 w-full">
            <h1 className="text-2xl font-jb font-extrabold text-dark-100">
              Knowledge Base
            </h1>
            <p className="text-xs font-jb text-white-400 mt-1">
              Manage agents source of information.
            </p>
          </FlexColStart>

          <FlexRowEnd className="w-auto">
            <TooltipComp text="Add Data Source">
              <Button
                intent={"dark"}
                className="w-auto h-[36px] px-4 text-[10px] font-ppReg drop-shadow disabled:bg-dark-100/70 disabled:text-white-100"
                onClick={() => {
                  setActiveModal("add-kb");
                }}
                enableBounceEffect={true}
                disabled={getKbQuery.isPending}
              >
                <Plus size={15} />
              </Button>
            </TooltipComp>

            <TooltipComp text="Link Data Source">
              <Button
                intent={"dark"}
                className="h-[36px] px-4 text-[10px] font-ppReg drop-shadow disabled:bg-dark-100/70 disabled:text-white-100"
                //   onClick={() => {
                //     setModalOpen(true);
                //     getTwAvailableNumMut.mutate();
                //   }}
                enableBounceEffect={true}
                disabled={getKbQuery.isPending}
              >
                <Cable size={15} />
              </Button>
            </TooltipComp>
          </FlexRowEnd>
        </FlexRowStartBtw>
        <br />
        {/* knowledge base data section */}

        {tabLoading || getKbQuery.isPending ? (
          <ChildLoader className={"h-auto"} />
        ) : !getKbQuery.isPending && kb.length > 0 ? (
          <div className="w-full rounded-md border border-white-400/20 overflow-hidden">
            <Table>
              <TableHeader className="bg-white-300">
                <TableRow>
                  {tableHeader.map((t, i) => (
                    <TableHead
                      className={cn(
                        "w-auto",
                        t.align === "right" && "text-right"
                      )}
                      key={i}
                    >
                      <h2
                        className={cn(
                          "text-sm font-ppM font-bold text-gray-100",
                          i === 0 && "flex gap-2"
                        )}
                      >
                        {t.title}
                      </h2>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {kb.map((kb, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-light text-xs font-ppReg flex items-center justify-start gap-2">
                      <Library size={15} className="stroke-white-400" />
                      {kb.title}
                    </TableCell>
                    <TableCell className="text-xs">
                      <span className="px-2 py-[2px] bg-dark-100 rounded-full text-white-100 font-ppReg font-bold text-[10px]">
                        {kb.type}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs">
                      <span
                        className={cn(
                          "px-2 py-[2px] rounded-full  font-ppReg font-bold text-[10px] border-[1px] ",
                          kb.status === "untrained"
                            ? "text-red-305 border-red-100/30"
                            : "text-green-105 bg-green-100/10"
                        )}
                      >
                        {kb.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {kb.type === "WEB_PAGES" && (
                        <TooltipComp text={"Edit Data"}>
                          <button className="mr-2">
                            <Pen size={15} className="stroke-dark-100" />
                          </button>
                        </TooltipComp>
                      )}

                      {/* for now , we can only retrain webpages data */}
                      {/* Since pdf aren't getting stored anywhere */}
                      {kb.type === "WEB_PAGES" && (
                        <TooltipComp text={"Delete"}>
                          <button className="mr-2">
                            <Play size={15} className="stroke-green-100" />
                          </button>
                        </TooltipComp>
                      )}
                      <TooltipComp text={"Delete"}>
                        <button className="mr-2">
                          <Trash size={15} className="stroke-red-200" />
                        </button>
                      </TooltipComp>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <FlexColStart className="w-full h-full bg-white-100/10 rounded-md p-5">
            <p className="text-dark-100 font-ppReg">No knowledge base found</p>
          </FlexColStart>
        )}
      </FlexColStart>

      {activeModal === "add-kb" && (
        <AddKnowledgeBaseModal
          closeModal={() => setActiveModal(null)}
          refetch={() => getKbQuery.refetch()}
        />
      )}
    </div>
  );
}
