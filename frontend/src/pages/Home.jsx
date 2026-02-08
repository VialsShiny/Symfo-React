import {useEffect, useState} from 'react';
import Loader from './../ui/Loader';
import {fetchData} from './../utils/Fetch';

export default function Home() {
    const [payUrl, setPayUrl] = useState(0);
    const [loading, setLoading] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (payUrl) {
            return (window.location.href = payUrl);
        }
    }, [payUrl]);

    async function HandleStripe() {
        setLoading(true);
        const res = await fetchData('http://localhost/stripe/pay', {
            method: 'POST',
            body: JSON.stringify({
                cardProducts: [
                    {
                        id: 1,
                        qt: 1000,
                    },
                    {
                        id: 2,
                        qt: 2,
                    },
                    {
                        id: 3,
                        qt: 1,
                    },
                ],
            }),
        });

        if (res && !res.success) {
            setLoading(false);
            return setPayUrl(res);
        }

        if (!res?.success) {
            setLoading(false);
            console.log(res);

            return setError(
                `Une erreur s'est produite : ${res?.error?.message}`,
            );
        }
    }

    return (
        <div className="w-full min-h-screen flex flex-col justify-center items-center bg-grey-300">
            <button
                onClick={() => HandleStripe()}
                className="bg-orange-400 p-3 rounded-xl ring-1 ring-black shadow-lg hover:-translate-y-2 transition-all duration-300 ease-in-out focus:bg-orange-500"
            >
                Clique moi dessus !
            </button>
            {error && (
                <p className="text-red-700 text-md font-bold mt-3">{error}</p>
            )}

            {loading && <Loader />}
        </div>
    );
}
