import {Suspense, lazy} from 'react';
import {Route, Routes} from 'react-router-dom';
import NotFound from './pages/errors/404';
import LoadingScreen from './ui/LoadingScreen';

const Home = lazy(() => import('./pages/Home'));

export default function App() {
    return (
        <Suspense fallback={<LoadingScreen />}>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Suspense>
    );
}
