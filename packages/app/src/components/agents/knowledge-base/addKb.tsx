import {
  FlexColCenter,
  FlexColStart,
  FlexColStartCenter,
  FlexRowStart,
  FlexRowStartBtw,
  FlexRowStartCenter,
} from "@/components/Flex";
import { Brain, Trash, X } from "@/components/icons";
import Modal from "@/components/Modal";
import Button from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addKnowledgeBase } from "@/http/requests";
import { cn } from "@/lib/utils";
import type { KBType, ResponseData } from "@/types";
import { useMutation } from "@tanstack/react-query";
import React, { useRef, useState } from "react";
import toast from "react-hot-toast";

const Filetype = [
  {
    name: "PDF",
    enabled: true,
  },
  {
    name: "WEB_PAGES",
    enabled: true,
  },
  {
    name: "YT_VIDEOS",
    enabled: false,
  },
] as { name: KBType; enabled?: boolean }[];

type FileDetails = {
  data: File | null;
  name: string;
  size: number;
};

interface IAddKnowledgeBaseModalProps {
  closeModal: () => void;
  refetch: () => void;
}

export default function AddKnowledgeBaseModal({
  closeModal,
  refetch,
}: IAddKnowledgeBaseModalProps) {
  const [selectedKbType, setSelectedKbType] = useState<KBType | null>(
    Filetype[0].name
  );
  const [file, setFile] = useState<FileDetails | null>({
    data: null,
    name: "",
    size: 0,
  });
  const addKbMut = useMutation({
    mutationFn: async (data: any) => await addKnowledgeBase(data),
    onSuccess: (data: any) => {
      const resp = data as ResponseData;
      toast.success(resp.message ?? "Knowledge base added successfully");
      closeModal();
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message ?? "An error occurred");
    },
  });

  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      if (file) {
        const validType = ["application/pdf"];
        const size = file.size / 1024 / 1024;
        const type = file.type;

        if (!validType.includes(type)) {
          toast.error("Invalid file type");
          return;
        }

        if (size > 4.5) {
          toast.error("File size should not exceed 4.5MB");
          return;
        }
        setFile({
          data: file,
          name: file.name,
          size: size,
        });
      }
    }
  };

  const submitData = () => {
    if (selectedKbType === "PDF" && file?.data) {
      const formData = new FormData();
      formData.append("file", file.data);
      formData.append("type", selectedKbType);
      formData.append("title", file.name);

      // dispatch action to upload file
      addKbMut.mutate(formData);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={() => closeModal()}
      isBlurBg
      fixed={false}
      className=""
    >
      <FlexColStart className="w-full max-h-[600px] min-w-[500px] h-full bg-white-300 rounded-[22px] p-1">
        <FlexColStart className="w-full h-auto bg-white-100 rounded-[20px] relative">
          <button
            className="w-[30px] h-[30px] rounded-full border-none outline-none flex flex-col items-center justify-center absolute top-3 right-3 bg-white-400/20 scale-[.85] active:scale-[.95] transition-all"
            onClick={() => {
              closeModal();
              addKbMut.reset();
            }}
          >
            <X size={15} color="#000" />
          </button>

          <FlexRowStart className="w-full px-4 py-5 border-b-[1px] border-dashed border-b-white-400/20 ">
            <FlexColCenter className="w-auto border-[2px] bg-dark-100 rounded-full p-1 relative">
              <Brain size={20} className="stroke-white-100 p-1" />
            </FlexColCenter>

            <FlexColStart className="w-full gap-1">
              <h1 className="font-ppM font-bold text-lg">Add Data Source</h1>
              <p className="text-xs font-ppReg font-light text-gray-500">
                Add a new knowledge base to the agent
              </p>
            </FlexColStart>
          </FlexRowStart>

          <FlexColStart className="w-full h-full px-5 pb-5 mt-3 relative overflow-auto transition-all">
            <FlexRowStartBtw className="w-full bg-white-400/10 rounded-full px-[3px] py-[5px] border-[1px] border-white-400/10 ">
              {Filetype.map((f, i) => (
                <button
                  key={i}
                  className={cn(
                    "w-full px-4 py-2 rounded-2xl text-xs font-jb font-semibold transition-all scale-[.95] active:scale-[1] disabled:opacity-50 disabled:cursor-not-allowed",
                    f.enabled && selectedKbType === f.name
                      ? "bg-white-100 text-dark-100 border-none outline-none"
                      : "bg-none text-white-400/80"
                  )}
                  disabled={!f.enabled}
                  onClick={() => setSelectedKbType(f.name)}
                >
                  {f.name}
                </button>
              ))}
            </FlexRowStartBtw>

            {selectedKbType === "PDF" && (
              <FlexColCenter className="w-full h-full min-h-[100px] bg-white-400/10 rounded-2xl mt-3 border-dashed border-[2px] border-white-400/20 relative">
                <span className="absolute top-2 right-3 text-[10px] font-jb text-white-400">
                  Max(4.5MB)
                </span>
                {!file?.data && (
                  <FlexColStartCenter>
                    <button onClick={() => fileRef.current?.click()}>
                      <p className="text-xs font-jb font-semibold text-gray-500">
                        Click to Upload
                      </p>
                    </button>
                    <input
                      type="file"
                      name="file"
                      ref={fileRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".pdf"
                    />
                  </FlexColStartCenter>
                )}
                {file?.data && (
                  <FlexColStartCenter>
                    <FlexRowStartBtw>
                      <span className="text-xs font-jb text-white-400">
                        {file.name.length > 20
                          ? file.name.slice(0, 20) + "..."
                          : file.name}
                      </span>
                      <button
                        onClick={() => {
                          setFile(null);
                          addKbMut.reset();
                        }}
                      >
                        <Trash size={15} className="stroke-white-400" />
                      </button>
                    </FlexRowStartBtw>
                    <span className="text-[10px] font-jb text-white-400">
                      {file.size.toFixed(2)}MB
                    </span>
                  </FlexColStartCenter>
                )}
              </FlexColCenter>
            )}

            {selectedKbType === "WEB_PAGES" && (
              <FlexColStart className="w-full h-auto bg-white-400/10 rounded-2xl mt-3 border-[1px] border-white-400/20 relative px-6 py-8">
                <FlexRowStartCenter className="w-full h-[50px] py-1 px-1 bg-white-100 rounded-full gap-0 overflow-hidden border-[1px] border-white-400/20">
                  <input
                    className="bg-none outline-none border-none ring-0 w-full h-[30px] text-dark-100 font-jb text-xs font-semibold px-5 translate-x-1"
                    placeholder="https://www.example.com"
                  />
                  <Button
                    intent={"dark"}
                    className="w-[150px] h-[40px] px-4 text-[10px] font-ppReg drop-shadow disabled:bg-dark-100/30 disabled:text-white-100 rounded-full"
                    //   onClick={() => {
                    //     setModalOpen(true);
                    //     getTwAvailableNumMut.mutate();
                    //   }}
                    enableBounceEffect={true}
                    disabled={true}
                  >
                    Fetch Pages
                  </Button>
                </FlexRowStartCenter>

                {/* webpage url's */}
                <FlexColStart className="w-full h-full max-h-[200px] gap-1 overflow-scroll overflow-x-hidden">
                  {Array.from({ length: 0 }).map((_, i) => (
                    <FlexRowStart className="w-full mt-3" key={i}>
                      <span className="text-xs font-jb font-semibold text-white-400">
                        https://www.example.com
                      </span>
                      <button>
                        <Trash size={15} className="stroke-white-400" />
                      </button>
                    </FlexRowStart>
                  ))}
                </FlexColStart>
              </FlexColStart>
            )}
            {/* Control */}
            <FlexColCenter className="w-full mt-5 gap-1">
              <Button
                intent={"dark"}
                className="w-full px-4 text-[10px] font-ppReg drop-shadow disabled:bg-dark-100/30 disabled:text-white-100 rounded-2xl"
                onClick={submitData}
                enableBounceEffect={true}
                disabled={
                  !file?.data && selectedKbType === "PDF" ? true : false
                }
                isLoading={addKbMut.isPending}
              >
                Submit Data
              </Button>

              <span className="text-[10px] font-jb font-semibold text-white-400 cursor-pointer underline">
                Link Data Source
              </span>
            </FlexColCenter>
          </FlexColStart>
        </FlexColStart>
      </FlexColStart>
    </Modal>
  );
}
