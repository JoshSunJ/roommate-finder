import {NextResponse} from "next/server";
import {profiles} from "@/features/profiles/data";

export async function GET() {
    return NextResponse.json(profiles);
}


