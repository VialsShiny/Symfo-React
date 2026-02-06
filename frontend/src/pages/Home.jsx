import {useState} from 'react';
import Loader from './../ui/Loader';
import {fetchData} from './../utils/Fetch';

export default function Home() {
    const [payUrl, setPayUrl] = useState(0);
    const [loading, setLoading] = useState(null);
    const [error, setError] = useState(null);

    async function HandleStripe() {
        setLoading(true);
        const res = await fetchData('http://localhost/stripe/pay');

        if (res) setLoading(false);
        return setPayUrl(res);
    }

    return (
        <>
            <button onClick={() => HandleStripe()}>Clique moi dessus !</button>

            <br />

            {loading && <Loader />}

            <p>{payUrl}</p>
        </>
    );
}
