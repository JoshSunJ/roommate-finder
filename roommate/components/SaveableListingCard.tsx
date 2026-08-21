import ListingCard from "@/components/ListingCard";
import SaveItemButton from "@/components/SaveItemButton";
import type { Listing } from "@/features/listings/types";

type Props = {
  listing: Listing;
  isSaved: boolean;
  signedIn: boolean;
  isSelected?: boolean;
  onPreview?: () => void;
  onShowOnMap?: () => void;
};

export default function SaveableListingCard({
  listing,
  isSaved,
  signedIn,
  isSelected = false,
  onPreview,
  onShowOnMap,
}: Props) {
  return (
    <div
      id={`listing-card-${listing.id}`}
      className={`saveable-card${isSelected ? " saveable-card--selected" : ""}`}
      onPointerEnter={onPreview}
      onFocusCapture={onPreview}
    >
      <ListingCard listing={listing} />
      <SaveItemButton targetType="listing" targetId={listing.id} initialSaved={isSaved} signedIn={signedIn} />
      {onShowOnMap && listing.coordinates && (
        <button type="button" className="show-on-map-button" onClick={onShowOnMap}>
          Show on map
        </button>
      )}
    </div>
  );
}
