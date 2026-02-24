"use client"

import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"

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
}

export function GenerateQuoteButton({ data }: { data: QuoteData }) {

    const handleGenerateQuote = () => {
        const totalDays = Math.max(
            1,
            Math.ceil(
                (new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) / (1000 * 60 * 60 * 24)
            )
        )

        const rows = data.packingList.map((item) => {
            const lineTotal = item.quantity * item.dailyPrice * totalDays
            return `
                <tr>
                    <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0">${item.name}</td>
                    <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:center">${item.category}</td>
                    <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:center">${item.quantity}</td>
                    <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:right">&euro; ${item.dailyPrice.toFixed(2)}</td>
                    <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600">&euro; ${lineTotal.toFixed(2)}</td>
                </tr>
            `
        })

        const grandTotal = data.packingList.reduce((acc, item) => {
            return acc + item.quantity * item.dailyPrice * totalDays
        }, 0)

        const today = new Date().toLocaleDateString('it-IT')

        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Preventivo - ${data.eventName}</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                * { margin:0; padding:0; box-sizing:border-box }
                body { font-family:'Inter',sans-serif; color:#1e293b; padding:40px; font-size:13px }
                .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:40px; border-bottom:3px solid #14b8a6; padding-bottom:20px }
                .logo { font-size:24px; font-weight:700; color:#0f172a }
                .logo span { color:#14b8a6 }
                .doc-info { text-align:right; color:#64748b; font-size:12px }
                .doc-info strong { color:#1e293b; display:block; font-size:14px; margin-bottom:4px }
                .section { margin-bottom:24px }
                .section-title { font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#64748b; font-weight:600; margin-bottom:8px }
                .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px }
                .info-box { background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:16px }
                .info-box label { font-size:11px; color:#94a3b8; display:block; margin-bottom:2px }
                .info-box p { font-weight:500 }
                table { width:100%; border-collapse:collapse; margin-top:8px }
                thead th { background:#f1f5f9; padding:10px 12px; text-align:left; font-size:11px; text-transform:uppercase; letter-spacing:0.5px; color:#64748b; font-weight:600 }
                .total-row { background:#f0fdfa }
                .total-row td { padding:14px 12px; font-weight:700; font-size:15px; color:#0f766e }
                .footer { margin-top:40px; padding-top:16px; border-top:1px solid #e2e8f0; color:#94a3b8; font-size:11px; text-align:center }
                @media print { body { padding:20px } }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo">Service<span>Pro</span></div>
                <div class="doc-info">
                    <strong>PREVENTIVO</strong>
                    Rif: ${data.eventId.split('-')[0].toUpperCase()}<br>
                    Data: ${today}<br>
                    Giorni noleggio: ${totalDays}
                </div>
            </div>

            <div class="section">
                <div class="info-grid">
                    <div class="info-box">
                        <label>Evento</label>
                        <p>${data.eventName}</p>
                    </div>
                    <div class="info-box">
                        <label>Cliente</label>
                        <p>${data.clientName}</p>
                        <span style="font-size:12px;color:#64748b">${data.clientEmail}</span>
                    </div>
                    <div class="info-box">
                        <label>Periodo</label>
                        <p>${new Date(data.startDate).toLocaleDateString('it-IT')} &ndash; ${new Date(data.endDate).toLocaleDateString('it-IT')}</p>
                    </div>
                    <div class="info-box">
                        <label>Location</label>
                        <p>${data.location || 'Da definire'}</p>
                    </div>
                </div>
            </div>

            <div class="section">
                <div class="section-title">Dettaglio Attrezzatura</div>
                <table>
                    <thead>
                        <tr>
                            <th>Articolo</th>
                            <th style="text-align:center">Categoria</th>
                            <th style="text-align:center">Q.t&agrave;</th>
                            <th style="text-align:right">Prezzo/GG</th>
                            <th style="text-align:right">Totale</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows.join('')}
                        <tr class="total-row">
                            <td colspan="4" style="text-align:right;padding:14px 12px">TOTALE PREVENTIVO</td>
                            <td style="text-align:right;padding:14px 12px">&euro; ${grandTotal.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="footer">
                Documento generato automaticamente da ServicePro &bull; ${today}
            </div>

            <script>window.onload=function(){window.print()}<\/script>
        </body>
        </html>
        `

        const printWindow = window.open('', '_blank')
        if (printWindow) {
            printWindow.document.write(html)
            printWindow.document.close()
        }
    }

    return (
        <Button variant="outline" onClick={handleGenerateQuote}>
            <FileText className="mr-2 h-4 w-4" /> Preventivo
        </Button>
    )
}
