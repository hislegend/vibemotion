import path from "path";
import fs from "fs";
import { COMP_NAME } from "../../../../types/constants";
import { RenderRequest } from "../../../../types/schema";
import { executeApi } from "../../../helpers/api-response";

let bundleLocation: string | null = null;

const ensureBundle = async () => {
  if (bundleLocation) return bundleLocation;

  // Dynamic imports to avoid Turbopack trying to parse esbuild binary
  const { bundle } = await import("@remotion/bundler");
  const { webpackOverride } = await import("../../../remotion/webpack-override.mjs");

  const entryPoint = path.join(process.cwd(), "src/remotion/index.ts");
  bundleLocation = await bundle({
    entryPoint,
    webpackOverride,
  });
  return bundleLocation;
};

export const POST = executeApi(RenderRequest, async (_req, body) => {
  const { code, durationInFrames, fps } = body.inputProps;
  const format = "mp4";

  // Dynamic imports to avoid Turbopack parsing esbuild binary
  const { renderMedia, selectComposition } = await import("@remotion/renderer");

  const bundled = await ensureBundle();

  const composition = await selectComposition({
    serveUrl: bundled,
    id: COMP_NAME,
    inputProps: { code, durationInFrames, fps },
  });

  const rendersDir = path.join(process.cwd(), "public/renders");
  if (!fs.existsSync(rendersDir)) {
    fs.mkdirSync(rendersDir, { recursive: true });
  }

  const fileName = `${Date.now()}.${format}`;
  const outputLocation = path.join(rendersDir, fileName);

  await renderMedia({
    composition,
    serveUrl: bundled,
    codec: "h264",
    outputLocation,
  });

  const stat = fs.statSync(outputLocation);

  return {
    url: `/renders/${fileName}`,
    size: stat.size,
  };
});
