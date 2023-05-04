import React, { useEffect, useState } from 'react';

/* Next router */
import { useRouter } from 'next/router';
import Link from 'next/link';

/* Handlers */
import { query } from '@/api/search'

/* Types */
import { DocResult, Method, QueryResponse } from '@/types/Types.types';

/* Display code */
import { CodeBlock, solarizedDark, monoBlue, tomorrowNightBlue } from "react-code-blocks";

/* Icons */
import { ArrowLeftIcon } from '@heroicons/react/20/solid';

/* Components */
import Button from '@/components/Button';

/* Requests */
import axios from "axios";

function SearchResults() {
    const router = useRouter();

    const [loading, setLoading] = useState<boolean>(true);
    const [results, setResults] = useState<QueryResponse | null>();
    const [timeTaken, setTimeTaken] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [searchType, setSearchType] = useState<'class' | 'method'>();
    const [methodName, setMethodName] = useState<string | null | undefined>();
    const [numResults, setNumResults] = useState<number>(5);

    /* Get search results */
    useEffect(() => {
        const { q } = router.query;

        if (q != undefined && loading) {
            (async () => {
                const startTime = performance.now();
                try {
                    const response = await query(q as string);
                    setResults(response);
                } catch (error) {
                    setError("Server is down, please try again later.");
                }
                const qry = decodeURIComponent(q as string)
                const type = qry.split(':');
                if (type[0] === 'methodName') {
                    setSearchType('method');
                    const name = type[1].split(' ')[0];
                    setMethodName(name);
                } else {
                    setSearchType('class');
                    setMethodName(null);
                }

                const endTime = performance.now();
                setTimeTaken(endTime - startTime);
                setLoading(false);
            })();
        }

    }, [loading, router]);

    return (
        <main
			className={`min-h-screen`}
		>
            <div className="h-screen w-full pattern-cross pattern-indigo-600 pattern-bg-primarybg pattern-size-8 pattern-opacity-10 fixed z-0"></div>
            
            <div className='flex-col flex space-y-10 p-5 md:p-24 w-full items-center z-10'>
                
                <h1 className={`text-6xl font-bold text-center rounded-xl px-4 py-1 text-gray-100`}>
					Congenial System
                </h1>
                
                <div className='flex flex-row justify-between items-center md:items-end text-white z-10 w-full sm:w-3/4 md:w-2/3 lg:w-1/2'>
                    <Link href='/' legacyBehavior>
                        <a>
                            <div className='flex flex-row items-center'>
                                <ArrowLeftIcon className='inline-block w-6 h-6 mr-2' />
                                <h1 className='text-sm md:text-xl font-bold'>Back to search</h1>
                            </div>
                        </a>
                    </Link>
                    {results && <p className='text-xs md:text-sm italic'> Found {results.hits.total.value} results in {(timeTaken / 1000).toFixed(3)} seconds </p>}
                </div>

                {loading ? (
                    <div className='text-white'> Loading... </div>
                ) : results && results.hits.hits.length > 0 && methodName != undefined && searchType ? (
                        <div className='text-white space-y-4 w-full sm:w-3/4 md:w-2/3 lg:w-1/2'>
                            {results.hits.hits.slice(0, numResults).map((result: DocResult) => {
                                return (
                                    <ResultCard key={result._id} res={result} searchType={searchType} methodName={methodName}/>
                                )
                            })}
                            {numResults < results.hits.hits.length && (
                                <Button
                                    title='Show more results'
                                    className='w-full'
                                    onClick={() => setNumResults(numResults + 5)}
                                />
                            )}

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

function ResultCard({ res, searchType, methodName }: { res: DocResult, searchType: 'class' | 'method', methodName: string | null }) {

    const [codePreview, setCodePreview] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [methodLine, setMethodLine] = useState<number | null>(null);

    useEffect(() => {
        if (!res) return;
        (async () => {
            try {
                const code = await fetchCode(res._source.download_url);
                let codePrev = extractLines(code, res._source.line - 1, 2);
                if (searchType === 'method') {
                    // Find line for methodName in res._source.methods    
                    const method = res._source.methods.find((method: Method) => method.methodName.toLowerCase() === methodName?.toLowerCase());
                    const line = method?.line;

                    if (line) {
                        setMethodLine(line);
                        const methodCodePrev = extractLines(code, line - 1);
                        codePrev += '\n···' + `\n${methodCodePrev}`;
                    }
                }

                setCodePreview(codePrev);
            } catch (error) {
                console.log(error);
            }
            setLoading(false);
        })();
    }, [res, searchType, methodName])

    async function fetchCode(url: string): Promise<any> {
        const response = await axios.get<any>(url);
        return response.data;
    }

    /* Extract lines for preview of code */
    function extractLines(codeStr: string, startLine: number, nLines: number = 5) {
        const lines = codeStr.split('\n');
        const startIndex = startLine;
        const endIndex = startIndex + nLines;
        return lines.slice(startIndex, endIndex).join('\n');
    }


    return (
        <a href={res._source.url} target="_blank" rel="noreferrer" className='block relative'>
            <div
                className='text-white text-sm border-[1px] border-indigo-600 rounded-lg p-6 bg-[#1c2943] transition transform ease-in-out duration-500 hover:scale-[1.03] cursor-pointer hover:ring-1 hover:ring-indigo-600 hover:outline-none'
            >
                <div className='mb-4 text-white'>
                    <div className='flex flex-row justify-between items-end'>
                        <h4 className='font-bold text-sm underline mb-2'>ClassName: {res._source.className} </h4>
                        <h4 className='text-xs font-thin'>Score: {res._score} </h4>
                    </div>
                    <h4 className='text-xs'>Modifiers: {res._source.modifiers} </h4>
                    <h4 className='text-xs font-thin truncate'>URL: {res._source.url} </h4>
                </div>
                <CodeBlock
                    language={'java'}
                    text={codePreview}
                    showLineNumbers={false}
                    theme={tomorrowNightBlue}
                    wrapLines={false}
                    startingLineNumber={res._source.line + 1}
                    codeBlock
                    highlight={methodLine ? '1,4' : '1'}
                />
            </div>
        </a>
    )
}

export default SearchResults;