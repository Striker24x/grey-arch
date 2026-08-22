import type { ComponentType } from "react";
import type { ServiceLayoutId } from "@/lib/service-layouts";
import type { ServiceLayoutProps } from "./types";
import EditorialAsymmetric from "./EditorialAsymmetric";
import BrokenGrid from "./BrokenGrid";
import Staggered from "./Staggered";
import AlternatingOffset from "./AlternatingOffset";
import SwissEditorial from "./SwissEditorial";
import Gallery from "./Gallery";
import Floating from "./Floating";
import Masonry from "./Masonry";
import Deconstructed from "./Deconstructed";
import Scrollytelling from "./Scrollytelling";

/** Single source of truth mapping a stored layout id to its React component. */
export const SERVICE_LAYOUT_COMPONENTS: Record<ServiceLayoutId, ComponentType<ServiceLayoutProps>> = {
  "editorial-asymmetric": EditorialAsymmetric,
  "broken-grid": BrokenGrid,
  staggered: Staggered,
  "alternating-offset": AlternatingOffset,
  "swiss-editorial": SwissEditorial,
  gallery: Gallery,
  floating: Floating,
  masonry: Masonry,
  deconstructed: Deconstructed,
  scrollytelling: Scrollytelling,
};
