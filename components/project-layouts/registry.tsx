import type { ComponentType } from "react";
import type { ServiceLayoutId } from "@/lib/service-layouts";
import type { ProjectLayoutProps } from "./types";
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
import CenteredStack from "./CenteredStack";

/** Same layout ids as the services layout registry, applied to a project's parsed content units. */
export const PROJECT_LAYOUT_COMPONENTS: Record<ServiceLayoutId, ComponentType<ProjectLayoutProps>> = {
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
  "centered-stack": CenteredStack,
};
