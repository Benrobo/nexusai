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
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TooltipComp from "@/components/TooltipComp";
import type { KBType } from "@/types";
import Button from "@/components/ui/button";
import AddKnowledgeBaseModal from "./addKb";

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

const tableRow = [
  {
    id: "",
    title: "Data title",
    type: "PDF",
  },
  {
    id: "",
    title: "Data title",
    type: "PDF",
  },
  {
    id: "",
    title: "Data title 3",
    type: "WEB_PAGES",
  },
] as { id: string; title: string; type: KBType }[];

type ActiveModal = "add-kb" | "link-kb";

export default function KnowledgeBase() {
  const [activeModal, setActiveModal] = useState<ActiveModal | null>("add-kb");

  return (
    <div className="w-full max-w-[100%] h-full px-10 py-10 relative">
      <FlexColStart className="w-full h-full ">
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
                //   onClick={() => {
                //     setModalOpen(true);
                //     getTwAvailableNumMut.mutate();
                //   }}
                enableBounceEffect={true}
                //   disabled={getTwAvailableNumMut.isPending}
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
                //   disabled={getTwAvailableNumMut.isPending}
              >
                <Cable size={15} />
              </Button>
            </TooltipComp>
          </FlexRowEnd>
        </FlexRowStartBtw>
        <br />
        {/* knowledge base data section */}

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
              {tableRow.map((r, i) => (
                <TableRow key={i}>
                  <TableCell className="font-light text-xs font-ppReg flex items-center justify-start gap-2">
                    <Library size={15} className="stroke-white-400" />
                    {r.title}
                  </TableCell>
                  <TableCell className="text-xs">
                    <span className="px-2 py-[2px] bg-dark-100 rounded-full text-white-100 font-ppReg font-bold text-[10px]">
                      {r.type}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs">
                    <span className="px-2 py-[2px] bg-green-100/10 rounded-full text-green-105 font-ppReg font-bold text-[10px] border-[1px] border-green-100">
                      Trained
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {r.type === "WEB_PAGES" && (
                      <TooltipComp text={"Edit Data"}>
                        <button className="mr-2">
                          <Pen size={15} className="stroke-dark-100" />
                        </button>
                      </TooltipComp>
                    )}
                    <TooltipComp text={"Delete"}>
                      <button className="mr-2">
                        <Play size={15} className="stroke-green-100" />
                      </button>
                    </TooltipComp>
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
      </FlexColStart>

      {activeModal === "add-kb" && <AddKnowledgeBaseModal />}
    </div>
  );
}
