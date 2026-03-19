export default function LoadingScreen() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 flex items-center justify-center">
            <div className="text-center">
                <div className="relative">
                    {/* Animated circles */}
                    <div className="w-24 h-24 relative mx-auto mb-8">
                        <div className="absolute inset-0 border-4 border-indigo-200 rounded-full animate-ping" />
                        <div className="absolute inset-0 border-4 border-t-indigo-600 border-r-purple-600 border-b-transparent border-l-transparent rounded-full animate-spin" />
                        <div className="absolute inset-3 border-4 border-t-purple-600 border-r-indigo-600 border-b-transparent border-l-transparent rounded-full animate-spin-reverse" />

                        {/* Shopping bag icon */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <svg
                                className="w-10 h-10 text-indigo-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    Chargement en cours
                </h2>
                <p className="text-slate-500 text-sm">
                    Préparation de votre expérience shopping...
                </p>

                {/* Loading dots */}
                <div className="flex justify-center gap-2 mt-6">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce-delay-0" />
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce-delay-1" />
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce-delay-2" />
                </div>
            </div>

            <style>{`
                @keyframes spin-reverse {
                    from {
                        transform: rotate(360deg);
                    }
                    to {
                        transform: rotate(0deg);
                    }
                }

                .animate-spin-reverse {
                    animation: spin-reverse 1s linear infinite;
                }

                @keyframes bounce-delay {
                    0%,
                    80%,
                    100% {
                        transform: translateY(0);
                    }
                    40% {
                        transform: translateY(-10px);
                    }
                }

                .animate-bounce-delay-0 {
                    animation: bounce-delay 1.4s ease-in-out infinite;
                    animation-delay: 0s;
                }

                .animate-bounce-delay-1 {
                    animation: bounce-delay 1.4s ease-in-out infinite;
                    animation-delay: 0.2s;
                }

                .animate-bounce-delay-2 {
                    animation: bounce-delay 1.4s ease-in-out infinite;
                    animation-delay: 0.4s;
                }
            `}</style>
        </div>
    );
}
