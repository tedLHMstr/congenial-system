import React, { useEffect, useState } from 'react';

/* Next router */
import { useRouter } from 'next/router';
import Link from 'next/link';

/* Handlers */
import { query, queryMethod, queryClass } from '@/api/search'

/* Types */
import { DocResult, Method, QueryResponse, MethodResponse, Class } from '@/types/Types.types';

/* Display code */
import { CodeBlock, tomorrowNightBlue } from "react-code-blocks";

/* Icons */
import { ArrowLeftIcon, ChevronDownIcon } from '@heroicons/react/20/solid';

/* Components */
import Button from '@/components/Button';
import { Fragment } from 'react'
import { Transition } from '@headlessui/react'

/* Requests */
import axios from "axios";
import classNames from 'classnames';


function SearchResults() {
    const router = useRouter();

    const [loading, setLoading] = useState<boolean>(true);
    const [results, setResults] = useState<MethodResponse | null>();
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
                const qry = decodeURIComponent(q as string)
                const type = qry.split(':')[0];
                setSearchType(type === 'methodName' ? 'method' : 'class');

                const startTime = performance.now();
                try {
                    let response;
                    if (type === 'methodName') {
                        response = await queryMethod(q as string);
                    } else {
                        response = await queryClass(q as string);
                    }
                    setResults(response);
                } catch (error) {
                    setError("Server is down, please try again later.");
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
                    {results && <p className='text-xs md:text-sm underline opacity-70'> Found {results.hits.total.value} results in {(timeTaken / 1000).toFixed(3)} seconds </p>}
                </div>

                {loading ? (
                    <div className='text-white'> Loading... </div>
                ) : results && results.hits.hits.length > 0 && searchType ? (
                        <div className='text-white space-y-6 w-full sm:w-3/4 md:w-2/3 lg:w-1/2'>
                            {results.hits.hits.slice(0, numResults).map((result: DocResult) => {
                                return (
                                    <ResultCard key={result._id} res={result} searchType={searchType} />
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

function ResultCard({ res, searchType }: { res: DocResult, searchType: 'class' | 'method' }) {

    const [codePreview, setCodePreview] = useState<string>('');
    const [method, setFullCode] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [codeExpanded, setCodeExpanded] = useState<boolean>(false);

    useEffect(() => {
        if (!res) return;
        (async () => {
            try {
                const code = await fetchCode(res._source.download_url);
                // let codePrev = extractLines(code, res._source.line - 1, 4);
                let fullCode = extractCodeSection(code, res._source.line);
                setFullCode(fullCode);
                let codePrev = extractLines(fullCode, 0, 4);
                setCodePreview(codePrev);
            } catch (error) {
                console.log(error);
            }
            setLoading(false);
        })();
    }, [res])

    /* Get code from GitHub */
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

    function extractCodeSection(javaCode: string, startLine: number) {
        const lines = javaCode.split('\n');
        const methodLines = [];
        let openBracesCount = 0;
      
        for (let i = startLine - 1; i < lines.length; i++) {
            const line = lines[i];
      
            if (line.includes('{')) {
                openBracesCount++;
            }
        
            if (line.includes('}')) {
                openBracesCount--;
            }
        
            methodLines.push(line);
        
            if (openBracesCount === 0 && i > startLine - 1) {
                break;
            }
        }
        return methodLines.join('\n');
    }

    return (
        <Transition
            appear={true}
            show={true}
            as={Fragment}
            enter="transition ease-in-out duration-500"
            enterFrom="opacity-0 translate-y-5"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
        >
        <a href={res._source.url} target="_blank" rel="noreferrer" className='block relative'>
            <div
                    className={
                        classNames(
                            'text-white text-sm border-[1px] border-indigo-600 rounded-lg p-6 bg-[#1c2943] transition transform ease-in-out duration-500 cursor-pointer hover:ring-1 hover:ring-indigo-600 hover:outline-none content-center',
                            !codeExpanded && 'hover:scale-[1.03]',
                        )
                    }
            >
                <div className='mb-4 text-white'>
                    <div className='flex flex-row justify-between items-end'>
                            <h4 className='font-bold text-sm underline mb-2'>{(searchType === 'method') ? 'Method name: ' + (res._source as Method).methodName : 'Class name: ' + (res._source as Class).className}</h4>
                        <h4 className='text-xs opacity-70'>Score: {res._score.toFixed(2)} </h4>
                    </div>
                    <h4 className='text-xs'>Modifiers: {res._source.modifiers.join(', ')} </h4>
                    <h4 className='text-xs font-thin truncate'>URL: {res._source.url} </h4>
                </div>
                <CodeBlock
                    language={'java'}
                    text={codeExpanded ? method : codePreview}
                    showLineNumbers={true}
                    theme={tomorrowNightBlue}
                    wrapLines={false}
                    startingLineNumber={res._source.line}
                    codeBlock
                    // highlight={methodLine ? '1,4' : '1'}
                />
                <Button
                    className='relative mt-0 w-full'
                    onClick={(event) => {
                        setCodeExpanded(!codeExpanded)
                        event.preventDefault();
                    }}
                    naked
                    icon={<ChevronDownIcon className={`inline-block w-6 h-6 transition duration-700 ${codeExpanded ? 'transform rotate-180' : ''}`} />}
                />
            </div>
            </a>
        </Transition>
    )
}

export default SearchResults;