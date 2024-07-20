import { useEffect, useState } from 'react';
import { APIRoutes } from '../../src/index';
import { hc } from 'hono/client';

const client = hc<APIRoutes>('/');

function App() {
    const [loading, setLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const res = await client.api.health.ok.$get();
            const data = await res.json();
            setMessage(data.message);
            setLoading(false);
        };

        fetchData();
    }, []);

    return (
        <main style={{ backgroundColor: '#222', height: '100vh', width: '100vw', margin: '0px', display: 'grid', justifyContent: 'center', alignItems: 'center' }}>
            <h1 style={{ margin: '0px', color: 'white' }}>{loading ? 'Loading...' : message}</h1>
        </main>
    );
}

export default App;
