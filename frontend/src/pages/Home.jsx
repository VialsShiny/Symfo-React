import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Loader from './../ui/Loader';
import { fetchData } from './../utils/Fetch';

export default function Home() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [payUrl, setPayUrl] = useState(null);
    const [cart, setCart] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingProduct, setLoadingProduct] = useState(false);
    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(null);
    const [cartOpen, setCartOpen] = useState(false);

    useEffect(() => {
        if (payUrl) {
            window.location.href = payUrl;
        }
    }, [payUrl]);

    useEffect(() => {
        const sessionId = searchParams.get('session_id');
        const status = searchParams.get('status');

        if (sessionId) {
            verifyPayment(sessionId);
        }

        if (status === 'cancel') {
            setError('Paiement annulé.');
            setSearchParams({}, { replace: true })
        }
    }, [searchParams]);

    // Auto-hide error after 5 seconds
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    // Auto-hide success after 5 seconds
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    const verifyPayment = async (sessionId) => {
        const data = await fetchData(`http://localhost/stripe/verify-payment?session_id=${sessionId}`);

        if (data.paid) {
            setSuccess('Paiement effectuée !');
        } else {
            setError("Paiement non validé.");
        }
        setSearchParams({}, { replace: true })
    };

    function handleCart(product) {
        setCart((prevCart) => {
            const existingProduct = prevCart.find(
                (item) => item.id === product.id,
            );

            if (existingProduct) {
                return prevCart.map((item) =>
                    item.id === product.id ? { ...item, qt: item.qt + 1 } : item,
                );
            }

            return [...prevCart, { id: product.id, qt: 1, ...product }];
        });
    }

    function removeFromCart(productId) {
        setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    }

    function updateQt(productId, qt) {
        if (qt <= 0) {
            removeFromCart(productId);
            return;
        }
        setCart((prevCart) =>
            prevCart.map((item) =>
                item.id === productId ? { ...item, qt } : item,
            ),
        );
    }

    async function getProducts() {
        setLoadingProduct(true);

        try {
            const res = await fetchData('http://localhost/articles');

            if (res || res.success) {
                setLoadingProduct(false);
                return setProducts(res);
            }

            if (!res?.success || !res) {
                setLoadingProduct(false);
                return setError(
                    `Une erreur s'est produite : ${res?.error?.message}`,
                );
            }
        } catch (err) {
            console.log(err);
            setError(err.message);
        } finally {
            setLoadingProduct(false);
        }
    }

    async function handleStripe() {
        if (cart.length === 0) {
            return setError('Votre panier est vide');
        }

        setLoading(true);

        try {
            const res = await fetchData('http://localhost/stripe/pay', {
                method: 'POST',
                body: JSON.stringify({
                    cartProducts: cart,
                    uri: window.location.href,
                }),
            });

            if (res || res.success) {
                setLoading(false);
                return setPayUrl(res);
            }

            if (!res?.success || !res) {
                setLoading(false);
                return setError(
                    `Une erreur s'est produite : ${res?.error?.message}`,
                );
            }
        } catch (err) {
            console.log(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getProducts();
    }, []);

    const cartTotal = cart.reduce((sum, item) => {
        const product = products.find((p) => p.id === item.id);
        return sum + (product?.price || 0) * item.qt;
    }, 0);

    const cartItemsCount = cart.reduce((sum, item) => sum + item.qt, 0);

    return (
        <>
            {/* Error Toast */}
            {error && (
                <div className="fixed top-6 right-6 z-[100] animate-slideInRight">
                    <div className="bg-gradient-to-br from-red-500 to-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 max-w-md backdrop-blur-sm border border-red-400/20">
                        <svg
                            className="w-6 h-6 flex-shrink-0 mt-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <div className="flex-1">
                            <p className="font-semibold text-sm">{error}</p>
                        </div>
                        <button
                            onClick={() => setError(null)}
                            className="text-white/80 hover:text-white transition-colors"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Success Toast */}
            {success && (
                <div className="fixed top-6 right-6 z-[100] animate-slideInRight">
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 max-w-md backdrop-blur-sm border border-green-400/20">
                        <svg
                            className="w-6 h-6 flex-shrink-0 mt-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <div className="flex-1">
                            <p className="font-semibold text-sm">{success}</p>
                        </div>
                        <button
                            onClick={() => setSuccess(null)}
                            className="text-white/80 hover:text-white transition-colors"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
                {/* Header */}
                <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-40">
                    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Boutique
                        </h1>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setCartOpen(!cartOpen)}
                                className="relative p-2 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <svg
                                    className="w-6 h-6 text-slate-700"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                </svg>
                                {cartItemsCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                        {cartItemsCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </header>

                {/* Products Grid */}
                <div className="max-w-7xl mx-auto px-6 py-12">
                    {loadingProduct ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <div
                                    key={product.id}
                                    className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-100"
                                >
                                    {/* Product Image Placeholder */}
                                    <div className="h-56 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 group-hover:scale-110 transition-transform duration-500" />
                                        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-bold text-slate-800">
                                            {product.price}€
                                        </div>
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-5">
                                        <h3 className="font-bold text-lg text-slate-800 mb-2 line-clamp-1">
                                            {product.title}
                                        </h3>
                                        <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                                            {product.content}
                                        </p>

                                        <button
                                            onClick={() => handleCart(product)}
                                            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                                        >
                                            Ajouter au panier
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!loadingProduct && products.length === 0 && (
                        <div className="text-center py-20">
                            <p className="text-slate-400 text-lg">
                                Aucun produit disponible
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Cart */}
            <div
                className={`fixed inset-x-0 bottom-0 md:inset-auto md:bottom-6 md:right-6 z-50 transition-all duration-300 ${cartOpen
                    ? 'translate-y-0 md:translate-x-0 opacity-100'
                    : 'translate-y-full md:translate-y-0 md:translate-x-[120%] opacity-0'
                    }`}
            >
                <div className="bg-white rounded-t-3xl md:rounded-3xl shadow-2xl border border-slate-200 w-full md:w-96 max-h-[85vh] md:max-h-[600px] flex flex-col overflow-hidden">
                    {/* Cart Header */}
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <svg
                                className="w-6 h-6 text-white"
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
                            <h2 className="text-white font-bold text-lg">
                                Mon Panier
                            </h2>
                        </div>
                        <button
                            onClick={() => setCartOpen(false)}
                            className="text-white/80 hover:text-white transition-colors"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {cart.length === 0 ? (
                            <div className="text-center py-12">
                                <svg
                                    className="w-16 h-16 mx-auto text-slate-300 mb-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                </svg>
                                <p className="text-slate-400 font-medium">
                                    Votre panier est vide
                                </p>
                            </div>
                        ) : (
                            cart.map((item) => {
                                const product = products.find(
                                    (p) => p.id === item.id,
                                );
                                return (
                                    <div
                                        key={item.id}
                                        className="bg-slate-50 rounded-2xl p-4 flex items-center gap-4 hover:bg-slate-100 transition-colors"
                                    >
                                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-xl flex-shrink-0" />

                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-slate-800 truncate">
                                                {product?.title ||
                                                    `Produit ${item.id}`}
                                            </h4>
                                            <p className="text-sm text-slate-500">
                                                {product?.price || 0}€
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() =>
                                                    updateQt(
                                                        item.id,
                                                        item.qt - 1,
                                                    )
                                                }
                                                className="w-7 h-7 bg-white rounded-lg flex items-center justify-center hover:bg-slate-200 transition-colors text-slate-600 font-bold"
                                            >
                                                −
                                            </button>
                                            <span className="w-8 text-center font-semibold text-slate-800">
                                                {item.qt}
                                            </span>
                                            <button
                                                onClick={() =>
                                                    updateQt(
                                                        item.id,
                                                        item.qt + 1,
                                                    )
                                                }
                                                className="w-7 h-7 bg-white rounded-lg flex items-center justify-center hover:bg-slate-200 transition-colors text-slate-600 font-bold"
                                            >
                                                +
                                            </button>
                                        </div>

                                        <button
                                            onClick={() =>
                                                removeFromCart(item.id)
                                            }
                                            className="text-red-400 hover:text-red-600 transition-colors p-1"
                                        >
                                            <svg
                                                className="w-5 h-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Cart Footer */}
                    {cart.length > 0 && (
                        <div className="border-t border-slate-200 p-6 space-y-4 bg-slate-50">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-600 font-medium">
                                    Total
                                </span>
                                <span className="text-2xl font-bold text-slate-800">
                                    {cartTotal.toFixed(2)}€
                                </span>
                            </div>

                            <button
                                onClick={handleStripe}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader />
                                        <span>Chargement...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg
                                            className="w-5 h-5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                            />
                                        </svg>
                                        <span>Procéder au paiement</span>
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Cart Toggle Button (when cart is closed) */}
            {!cartOpen && cart.length > 0 && (
                <button
                    onClick={() => setCartOpen(true)}
                    className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300"
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                    </svg>
                    <span className="absolute -top-2 -right-2 bg-white text-indigo-600 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg">
                        {cartItemsCount}
                    </span>
                </button>
            )}
        </>
    );
}
