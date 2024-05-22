"use client";
import OgTemplates from "@/data/templates";
import { GradientName, OgData, TemplateConf } from "@snapx/shared/types";
import React, { createContext, useContext, useEffect, useState } from "react";

interface EditorContextValuesProps {
  ogData: OgData;
  setOgData: React.Dispatch<React.SetStateAction<OgData>>;
  hasFrameColorSelected: boolean;
  setHasFrameColorSelected: React.Dispatch<React.SetStateAction<boolean>>;
  selectedTemplate?: TemplateConf | null;
  setSelectedTemplate?: React.Dispatch<
    React.SetStateAction<TemplateConf | null>
  >;
  activeMeshGradient?: string | null;
  setActiveMeshGradient?: React.Dispatch<React.SetStateAction<string | null>>;
  generatedOgUrl?: string;
  setGeneratedOgUrl?: React.Dispatch<React.SetStateAction<string>>;
  propertiesWindowOpen?: boolean;
  setPropertiesWindowOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const EditorContext = createContext<EditorContextValuesProps>(
  {} as EditorContextValuesProps
);

function EditorContextProvider({ children }: { children: React.ReactNode }) {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateConf | null>(
    null as TemplateConf | null
  );
  const [ogData, setOgData] = useState<OgData>(OgTemplates[0].ogData as OgData);
  const [hasFrameColorSelected, setHasFrameColorSelected] =
    useState<boolean>(false);
  const [activeMeshGradient, setActiveMeshGradient] = useState<string | null>(
    null
  );
  const [generatedOgUrl, setGeneratedOgUrl] = useState<string>("");
  const [propertiesWindowOpen, setPropertiesWindowOpen] =
    useState<boolean>(false);

  const providerValues: EditorContextValuesProps = {
    ogData,
    setOgData,
    hasFrameColorSelected,
    setHasFrameColorSelected,
    selectedTemplate,
    setSelectedTemplate,
    activeMeshGradient,
    setActiveMeshGradient,
    generatedOgUrl,
    setGeneratedOgUrl,
    propertiesWindowOpen,
    setPropertiesWindowOpen,
  };

  useEffect(() => {
    const savedTempId = JSON.parse(
      localStorage.getItem("snapx_template")!
    ) as string;
    if (savedTempId) {
      const selected = OgTemplates.find((t) => t.template_id === savedTempId);
      if (selected) {
        setSelectedTemplate(selected);
        setOgData(selected.ogData);
      } else {
        setSelectedTemplate(OgTemplates[0]);
        localStorage.setItem(
          "snapx_template",
          JSON.stringify(OgTemplates[0].template_id)
        );
      }
    } else {
      setSelectedTemplate(OgTemplates[0]);
    }
  }, []);

  return (
    <EditorContext.Provider value={providerValues}>
      {children}
    </EditorContext.Provider>
  );
}

export default EditorContextProvider;

export function useEditorContext() {
  return useContext(EditorContext);
}
