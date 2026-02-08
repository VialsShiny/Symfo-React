import {useEffect, useState} from 'react';
import Loader from './../ui/Loader';
import {fetchData} from './../utils/Fetch';

export default function Home() {
    const [payUrl, setPayUrl] = useState(null);
    const [cart, setCart] = useState([]);
    const [products, setProducts] = useState([]); // articles
    const [loading, setLoading] = useState(false);
    const [loadingProduct, setLoadingProduct] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (payUrl) {
            window.location.href = payUrl;
        }
    }, [payUrl]);

    function handleCart(product) {
        setCart((prevCart) => {
            const existingProduct = prevCart.find(
                (item) => item.id === product.id,
            );

            if (existingProduct) {
                return prevCart.map((item) =>
                    item.id === product.id ? {...item, qt: item.qt + 1} : item,
                );
            }

            return [
                ...prevCart,
                {
                    id: product.id,
                    qt: 1,
                    title: product.title,
                    price: product.price,
                },
            ];
        });
    }

    function removeFromCart(productId) {
        setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    }

    function updateqt(productId, qt) {
        setCart((prevCart) =>
            prevCart.map((item) =>
                item.id === productId ? {...item, qt} : item,
            ),
        );
    }

    async function getProducts() {
        setLoadingProduct(true);
        setError(null);

        try {
            const res = await fetchData('http://localhost/articles');

            // Accept either: an array directly, or an object with .data or .articles
            const data = Array.isArray(res)
                ? res
                : Array.isArray(res?.data)
                  ? res.data
                  : Array.isArray(res?.articles)
                    ? res.articles
                    : [];

            setProducts(data);
        } catch (err) {
            console.error(err);
            setError(
                err?.message || 'Erreur lors de la récupération des articles',
            );
        } finally {
            setLoadingProduct(false);
        }
    }

    async function handleStripe() {
        if (cart.length === 0) {
            return setError('Votre panier est vide');
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetchData('http://localhost/stripe/pay', {
                method: 'POST',
                body: JSON.stringify({
                    cartProducts: cart,
                }),
            });

            // Si l'API renvoie directement l'url ou un objet { url }
            const url = typeof res === 'string' ? res : (res?.url ?? res);
            setPayUrl(url);
        } catch (err) {
            console.error(err);
            setError(
                err?.message || "Erreur lors de l'initialisation du paiement",
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getProducts();
    }, []);

    function formatDate(iso) {
        if (!iso) return '';
        try {
            const d = new Date(iso);
            return d.toLocaleDateString('fr-FR');
        } catch {
            return iso;
        }
    }

    function truncate(text, n = 140) {
        if (!text) return '';
        return text.length > n ? text.slice(0, n).trim() + '…' : text;
    }

    return (
        <div className="w-full min-h-screen flex flex-col justify-center items-center bg-grey-300 gap-4 p-6">
            <button
                onClick={() => handleCart({id: 1})}
                className="bg-blue-400 p-2 rounded"
            >
                Ajouter produit #1
            </button>

            {/* Cart summary */}
            <div className="bg-white p-4 rounded shadow w-80">
                <h2 className="font-bold mb-2">Panier</h2>

                {cart.length === 0 && <p>Panier vide</p>}

                {cart.map((item) => (
                    <div
                        key={item.id}
                        className="flex justify-between items-center mb-2"
                    >
                        <div>
                            <div className="font-medium">
                                Produit {item.title ?? item.id}
                            </div>
                            {typeof item.price !== 'undefined' && (
                                <div className="text-sm text-gray-600">
                                    {item.price} €
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm">x{item.qt}</span>
                            <button
                                onClick={() => removeFromCart(item.id)}
                                className="text-red-500 px-2"
                                aria-label={`Supprimer ${item.title ?? item.id}`}
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Articles list (refait proprement, sans comments) */}
            <div className="w-full max-w-4xl">
                <h2 className="text-xl font-bold mb-4">Articles</h2>

                {loadingProduct ? (
                    <div className="flex justify-center">
                        <Loader />
                    </div>
                ) : products.length === 0 ? (
                    <p className="text-gray-600">Aucun article trouvé.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {products.map((item) => (
                            <article
                                key={item.id}
                                className="bg-white rounded shadow p-4 flex flex-col justify-between"
                            >
                                <div>
                                    <h3 className="font-semibold text-lg mb-1">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm text-gray-700 mb-2">
                                        {truncate(item.content)}
                                    </p>
                                </div>

                                <div className="mt-3 flex items-center justify-between">
                                    <div className="text-xs text-gray-500">
                                        {formatDate(item.published_at)}
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {typeof item.price !== 'undefined' && (
                                            <div className="font-medium">
                                                {item.price} €
                                            </div>
                                        )}
                                        <button
                                            onClick={() =>
                                                handleCart({
                                                    id: item.id,
                                                    title: item.title,
                                                    price: item.price,
                                                })
                                            }
                                            className="bg-blue-500 text-white px-3 py-1 rounded hover:opacity-90 transition"
                                            aria-label={`Ajouter ${item.title} au panier`}
                                        >
                                            Ajouter
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>

            <button
                onClick={() => handleStripe()}
                className="bg-orange-400 p-3 rounded-xl ring-1 ring-black shadow-lg hover:-translate-y-1 transition mt-6"
            >
                Payer
            </button>

            {error && (
                <p className="text-red-700 text-md font-bold mt-3">{error}</p>
            )}

            {loading && <Loader />}
        </div>
    );
}
