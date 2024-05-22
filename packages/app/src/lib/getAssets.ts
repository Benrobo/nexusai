import { gradientData, meshGradient } from "@snapx/shared/data/colors";
import { localImageConstruct } from "@snapx/shared/data/og-data";
import { FrameBgTypes, PQDataValues } from "@snapx/shared/types";
import env from "@/config/env";

// a multipurpose function to get gradient colors as well as solid colors and bg-image
type ReturnValue = {
  type: FrameBgTypes;
  value: string | string[];
  name: string;
}[];

export default function getSnapxAssets(PQData: PQDataValues): ReturnValue {
  const bgName = PQData?.frame_bg_name;
  const bgType = PQData?.frame_bg_type;
  const bgColor = PQData?.frame_bg_color;
  const cls1 = PQData?.cls_1;
  const cls2 = PQData?.cls_2;
  const templateId = PQData?.template_id.toLowerCase();
  const includeMockup =
    PQData?.mockup_url ||
    PQData?.mockup_pos_x ||
    PQData?.mockup_pos_y ||
    PQData?.mockup_width
      ? true
      : false;

  const assetsStore: ReturnValue = [];
  if (bgType && bgType === "gradient") {
    const gradientClr = gradientData.find(
      (g) => g.name.toLowerCase() === bgName.toLowerCase()
    );
    if (gradientClr) {
      assetsStore.push({
        type: "gradient",
        value: gradientClr.gradient.join(","),
        name: "Gradient",
      });
    }
  }
  if (bgType && bgType === "mesh-gradient") {
    const meshGd = meshGradient.find(
      (m) => m.name.toLowerCase() === bgName.toLowerCase()
    );
    if (meshGd) {
      assetsStore.push({
        type: "image",
        value: `${env.CLIENT_BASE_URL}${meshGd.path}`,
        name: "Mesh Gradient",
      });
    }
  }
  if (cls1 && cls2) {
    assetsStore.push({
      type: "solid",
      value: [cls1, cls2],
      name: "Color Stops",
    });
  }
  if (bgColor) {
    assetsStore.push({
      type: "solid",
      value: `#${bgColor}`,
      name: "Solid Color",
    });
  }
  if (includeMockup) {
    if (templateId === "pitch") {
      const mockupPath =
        localImageConstruct.find((i) => i.type === "pitch-mockup")?.url ??
        PQData?.mockup_url;

      const logoPath =
        localImageConstruct.find((i) => i.type === "pitch-logo")?.url ??
        PQData?.logo_url;

      if (mockupPath) {
        assetsStore.push({
          type: "image",
          value: `${env.CLIENT_BASE_URL}${mockupPath}`,
          name: "Mockup Image",
        });
      }
      if (logoPath) {
        assetsStore.push({
          type: "image",
          value: `${env.CLIENT_BASE_URL}${logoPath}`,
          name: "Logo",
        });
      }
    }
  }

  // handle individual template assets
  if (templateId === "blogr") {
    const avatarPath =
      localImageConstruct.find((i) => i.type === "avatar")?.url ??
      PQData?.avatar_url;

    if (avatarPath) {
      assetsStore.push({
        type: "image",
        value: `${env.CLIENT_BASE_URL}${avatarPath}`,
        name: "Avatar",
      });
    }
  }
  return assetsStore;
}
