// app/api/inngest/route.ts
import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/inngest-client";
import { ingestPdf } from "@/lib/inngest/functions/ingest-pdf";

export const maxDuration = 300;

export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [ingestPdf],
}); 

