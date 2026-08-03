"use client";

import dynamic from "next/dynamic";
import type { Coordinates } from "@/features/listings/types";

type Props = {
    value: Coordinates | null;
    onChange: (coordinates: Coordinates) => void;
};

const ListingLocationPickerInner = dynamic(
    () => import("./ListingLocationPickerInner"),
    {
        ssr: false,
        loading: () => (
            <div className="map-loading">Loading location picker…</div>
        ),
    },
);

export default function ListingLocationPicker(props: Props) {
    return <ListingLocationPickerInner {...props} />;
}