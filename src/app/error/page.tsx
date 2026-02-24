export default function ErrorPage() {
    return (
        <div className="flex h-screen w-full items-center justify-center p-4 bg-slate-50">
            <div className="max-w-md text-center border p-8 rounded-lg shadow-sm bg-white">
                <h1 className="text-2xl font-bold mb-4">Si è verificato un errore</h1>
                <p className="text-slate-600 mb-6">Siamo spiacenti, si è verificato un problema improvviso. Riprova più tardi o contatta il supporto se il problema persiste.</p>
                <a href="/" className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors">
                    Torna alla Dashboard
                </a>
            </div>
        </div>
    )
}
