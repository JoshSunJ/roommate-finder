import ListingCard from "@/components/ListingCard";
import SaveItemButton from "@/components/SaveItemButton";
import type { Listing } from "@/features/listings/types";

type Props = { listing: Listing; isSaved: boolean; signedIn: boolean };

export default function SaveableListingCard({ listing, isSaved, signedIn }: Props) {
  return (
    <div className="saveable-card">
      <ListingCard listing={listing} />
      <SaveItemButton targetType="listing" targetId={listing.id} initialSaved={isSaved} signedIn={signedIn} />
    </div>
  );
}
