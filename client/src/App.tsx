import { useEffect, useState } from 'react';
import { APIRoutes } from '../../src/server';
import { hc } from 'hono/client';

const client = hc<APIRoutes>('/');

function App() {
    const [message, setMessage] = useState<string>('');

    useEffect(() => {
        const fetchData = async () => {
            const res = await client.api.health.ok.$get();
            const data = await res.json();
            setMessage(data.message);
        };

        fetchData();
    }, []);

    return <main>{message}</main>;
}

export default App;
