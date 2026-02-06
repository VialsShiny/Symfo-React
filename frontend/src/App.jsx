import {Suspense, lazy} from 'react';
import {Route, Routes} from 'react-router-dom';

const Home = lazy(() => import('./pages/Home'));

function App() {
    return (
        <Suspense fallback={<p>Loading...</p>}>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="*" element={<p>404</p>} />
            </Routes>
        </Suspense>
    );
}

export default App;
