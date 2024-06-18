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
  ChevronDown,
  ChevronRight,
  Library,
  Play,
  Trash,
} from "@/components/icons";
import { cn } from "@/lib/utils";
import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
];

export default function KnowledgeBase() {
  return (
    <div className="w-full max-w-[100%] h-full px-10 py-10">
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
        </FlexRowStartBtw>
        <br />
        {/* knowledge base data */}

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
                    <span className="px-2 py-[2px] bg-green-100/10 rounded-full text-green-100 font-ppReg font-bold text-[10px] border-[1px] border-green-100">
                      Trained
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <TooltipProvider delayDuration={20}>
                      <Tooltip>
                        <TooltipTrigger>
                          <button className="mr-2">
                            <Trash size={15} className="stroke-dark-100" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-ppReg text-xs">
                            Delete knowledge base
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider delayDuration={20}>
                      <Tooltip>
                        <TooltipTrigger>
                          <button>
                            <Play size={15} className="stroke-dark-100" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-ppReg text-xs">Re-train Data</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </FlexColStart>
    </div>
  );
}
