import React, { useEffect, useState } from 'react';

/* Next router */
import { useRouter } from 'next/router';

/* Handlers */
import { query } from '@/api/search'

/* Types */
import { DocResult, Method, QueryResponse } from '@/types/Types.types';


function SearchResults() {
    const router = useRouter();
    const { q } = router.query;

    const [loading, setLoading] = useState<boolean>(true);
    const [results, setResults] = useState<QueryResponse | null>();
    const [timeTaken, setTimeTaken] = useState(0);
    const [error, setError] = useState<string | null>(null);

    /* Get search results */
    useEffect(() => {
        if (!q) {
            setLoading(false);
            return;
        }
        (async () => {
            if (!results) {
                const startTime = performance.now();
                try {
                    const response = await query(q as string);
                    setResults(response);
                } catch (error) {
                    setError("Server is down, please try again later.");
                }
                const endTime = performance.now();
                setTimeTaken(endTime - startTime);
                setLoading(false);
            }
        })();
    }, [q, results]);

    return (
        <main
			className={`min-h-screen`}
		>
            <div className="h-screen w-full pattern-cross pattern-indigo-600 pattern-bg-primarybg pattern-size-8 pattern-opacity-10 fixed"></div>
            
            <div className='flex-col flex space-y-10 p-10 md:p-24 w-full items-center'>
                
                <h1 className={`text-6xl font-bold text-center rounded-xl px-4 py-1 text-gray-100`}>
					Congenial System
				</h1>

                {loading ? (
                    <div className='text-white'> Loading... </div>
                ) : results && results.hits.hits.length > 0 ? (
                        <div className='text-white space-y-4'>
                           <p> Found {results.hits.total.value} results in {(timeTaken / 1000).toFixed(3)} seconds </p>
                            {results.hits.hits.map((result: DocResult) => {
                                return (
                                    <ResultCard key={result._id} res={result} />
                                )
                            })}
                        </div>
                    ) : 
                        !error ?
                            <div className='text-white'> No results found </div>
                            :
                            <div className='text-white'> {error} </div>
                }

            </div>
        </main>

    );
}

function ResultCard({ res }: { res: DocResult }) {
    return (
        <div
        className='text-white text-sm border-[1px] border-indigo-600 rounded-lg p-10 bg-[#1c2943] transition transform ease-in-out duration-500 hover:scale-105 cursor-pointer hover:ring-1 hover:ring-indigo-600 hover:outline-none'
        >
            <a href={res._source.url} target="_blank" rel="noreferrer">
                <h4 className='text-white'>ClassName: {res._source.className} </h4>
                <p className='text-white'>Modifiers: {res._source.modifiers} </p>
                <p className='text-white'> {res._source.url} </p>
            </a>
        </div>
    )
}

export default SearchResults;