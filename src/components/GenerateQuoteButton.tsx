"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { FileText, Loader2 } from "lucide-react"
import { PDFDownloadLink } from "@react-pdf/renderer"
import { QuoteDocument } from "./QuotePDF"

interface QuoteData {
    eventName: string
    eventId: string
    clientName: string
    clientEmail: string
    startDate: string
    endDate: string
    location: string
    packingList: Array<{
        name: string
        category: string
        quantity: number
        dailyPrice: number
    }>
    tenant: any
}

export function GenerateQuoteButton({ data }: { data: QuoteData }) {
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    if (!isClient) {
        return (
            <Button variant="outline" disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Preparazione...
            </Button>
        )
    }

    const fileName = `Preventivo_${data.eventId.split('-')[0]}_${data.eventName.replace(/[^a-z0-9]/gi, '_')}.pdf`

    return (
        <PDFDownloadLink
            document={<QuoteDocument data={data} />}
            fileName={fileName}
            style={{ textDecoration: 'none' }}
        >
            {/* 
              // @ts-ignore: Next.js + React-PDF types mismatch
            */}
            {({ loading }: { loading: boolean }) => (
                <Button variant="outline" disabled={loading} asChild={false}>
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generazione...
                        </>
                    ) : (
                        <>
                            <FileText className="mr-2 h-4 w-4" /> Scarica Preventivo
                        </>
                    )}
                </Button>
            )}
        </PDFDownloadLink>
    )
}
