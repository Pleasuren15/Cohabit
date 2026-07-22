import easternCape from "@/assets/provinces/eastern-cape.svg"
import freeState from "@/assets/provinces/free-state.svg"
import gauteng from "@/assets/provinces/gauteng.svg"
import kwazuluNatal from "@/assets/provinces/kwazulu-natal.svg"
import limpopo from "@/assets/provinces/limpopo.svg"
import mpumalanga from "@/assets/provinces/mpumalanga.svg"
import northWest from "@/assets/provinces/north-west.svg"
import northernCape from "@/assets/provinces/northern-cape.svg"
import westernCape from "@/assets/provinces/western-cape.svg"

/** Province key (matches the app's PROVINCES map) → extracted red shape SVG URL. */
export const PROVINCE_SHAPES: Record<string, string> = {
  ec: easternCape,
  fs: freeState,
  gp: gauteng,
  kzn: kwazuluNatal,
  lp: limpopo,
  mp: mpumalanga,
  nc: northernCape,
  nw: northWest,
  wc: westernCape,
}
