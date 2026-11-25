import type { CompositeAsset, FootwearAsset } from "../types/avatar";

export function resolveFootwear(
  asset: FootwearAsset | undefined,
  poseId: string
): CompositeAsset | undefined {
  if (!asset?.poseVariants) return asset;

  const variant = asset.poseVariants[poseId];
  return variant ? { ...variant, id: asset.id, label: asset.label } : undefined;
}
