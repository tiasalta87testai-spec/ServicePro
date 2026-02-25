"use client"

import dynamic from "next/dynamic"

const GenerateQuoteButton = dynamic(
    () => import("@/components/GenerateQuoteButton").then((mod) => mod.GenerateQuoteButton),
    { ssr: false, loading: () => <span /> }
)

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

export function GenerateQuoteButtonWrapper({ data }: { data: QuoteData }) {
    return <GenerateQuoteButton data={data} />
}
