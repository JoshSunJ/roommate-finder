import HousingRequestCard from "@/components/HousingRequestCard";
import SaveItemButton from "@/components/SaveItemButton";
import type { HousingRequest } from "@/features/housing-requests/types";

type Props = { request: HousingRequest; isSaved: boolean; signedIn: boolean };

export default function SaveableHousingRequestCard({ request, isSaved, signedIn }: Props) {
  return (
    <div className="saveable-card">
      <HousingRequestCard request={request} />
      <SaveItemButton targetType="housing_request" targetId={request.id} initialSaved={isSaved} signedIn={signedIn} />
    </div>
  );
}
