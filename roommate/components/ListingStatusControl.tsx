"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Listing } from "@/features/listings/types";
export default function ListingStatusControl({ listingId, currentStatus }: { listingId:number; currentStatus:Listing["status"] }) { const router=useRouter(); const [status,setStatus]=useState(currentStatus); async function save(){await fetch(`/api/listings/${listingId}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status})});router.refresh();} return <div className="listing-management"><select value={status} onChange={(e)=>setStatus(e.target.value as Listing["status"])}><option value="active">Active</option><option value="filled">Filled</option><option value="expired">Expired</option></select><button type="button" onClick={save} disabled={status===currentStatus}>Save status</button></div>; }
