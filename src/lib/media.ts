import type { StaticImageData } from "next/image";
import type { Collection, Product } from "@/types/commerce";

export function getProductImageSource(product: Product): string | StaticImageData {
  return product.featuredImageUrl || product.image;
}

export function getCollectionImageSource(collection: Collection): string | StaticImageData {
  return collection.imageUrl || collection.image;
}
