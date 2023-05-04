import React, { useEffect, useState } from 'react';

/* Next router */
import { useRouter } from 'next/router';
import Link from 'next/link';

/* Handlers */
import { query } from '@/api/search'

/* Types */
import { DocResult, Method, QueryResponse } from '@/types/Types.types';

/* Display code */
import { CopyBlock, solarizedDark, monoBlue, tomorrowNightBlue } from "react-code-blocks";

/* Icons */
import { ArrowLeftIcon } from '@heroicons/react/20/solid';


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
            <div className="h-screen w-full pattern-cross pattern-indigo-600 pattern-bg-primarybg pattern-size-8 pattern-opacity-10 fixed z-0"></div>
            
            <div className='flex-col flex space-y-10 p-10 md:p-24 w-full items-center'>
                
                <h1 className={`text-6xl font-bold text-center rounded-xl px-4 py-1 text-gray-100`}>
					Congenial System
				</h1>

                {loading ? (
                    <div className='text-white'> Loading... </div>
                ) : results && results.hits.hits.length > 0 ? (
                        <div className='text-white space-y-4 w-full sm:w-3/4 md:w-2/3 lg:w-1/2 z-10'>
                            <div className='flex flex-row justify-between items-end'>
                                <Link href='/' legacyBehavior>
                                    <a>
                                        <div className='flex flex-row items-center'>
                                            <ArrowLeftIcon className='inline-block w-6 h-6 mr-2' />
                                            <h1 className='text-xl font-bold'>Back to search</h1>
                                        </div>
                                    </a>
                                </Link>
                                <p className='text-sm italic'> Found {results.hits.total.value} results in {(timeTaken / 1000).toFixed(3)} seconds </p>
                            </div>
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

    const code = `package com.company;

    import java.util.Arrays;
    import java.util.Random;

        public class Main {
	

	private static ArrayList<HashMap<ArrayList<Integer>, Person>> makeArr(int l, HashMap<Integer, String> map) {
		int[] result = new int[l];
		
		for(int i = 0; i < l; i++) {
			result[i] = (int)(Math.random()*100000);
			
		}
			
		return result;
		
		
	}
	

}
    `;

    const [codePreview, setCodePreview] = useState<string>('');

    useEffect(() => {
        // get code from url
        const codePrev = extractLines(code, res._source.line, res._source.line + 4);
        setCodePreview(codePrev);

    }, [code, res])



    return (
        <a href={res._source.url} target="_blank" rel="noreferrer" className='block'>
            <div
                className='text-white text-sm border-[1px] border-indigo-600 rounded-lg p-6 bg-[#1c2943] transition transform ease-in-out duration-500 hover:scale-[1.03] cursor-pointer hover:ring-1 hover:ring-indigo-600 hover:outline-none'
            >
                <div className='mb-4 text-white'>
                    <h4 className='font-bold text-sm underline mb-2'>ClassName: {res._source.className} </h4>
                    <h4 className='text-xs'>Modifiers: {res._source.modifiers} </h4>
                    <h4 className='text-xs'>URL: {res._source.url} </h4>
                </div>
                <CopyBlock
                    language={'java'}
                    text={codePreview}
                    showLineNumbers={true}
                    theme={tomorrowNightBlue}
                    wrapLines={false}
                    startingLineNumber={res._source.line+1}
                    codeBlock
                    highlight={'1'}
                />
            </div>
        </a>
    )
}
        
/* Extract lines for preview of code */
function extractLines(codeStr: string, startLine: number, endLine: number) {
    // split the string into lines
    const lines = codeStr.split('\n');
    
    // get the starting and ending indices of the lines we want to extract
    const startIndex = startLine;
    const endIndex = Math.min(endLine, lines.length);
    
    // join the selected lines into a new string
    const selectedLines = lines.slice(startIndex, endIndex).join('\n');
    
    return selectedLines;
}

export default SearchResults;