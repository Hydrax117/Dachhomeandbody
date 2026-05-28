import { getActivePopupConfig } from "@/lib/popup"
import PromotionalPopup from "./PromotionalPopup"

/**
 * Server component — fetches the active popup config and passes it to the
 * client-side popup component. Renders nothing if the popup is disabled or
 * outside its date range.
 */
export default async function PromotionalPopupWrapper() {
  const config = await getActivePopupConfig()
  return <PromotionalPopup config={config} />
}
