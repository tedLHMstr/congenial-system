import React, { useState } from 'react'

/* Components */
import Input from '@/components/Input'
import Button from '@/components/Button'
import Dropdown from '@/components/Dropdown'

import Image from 'next/image'

/* ReturnTypes */
import returnTypes from '@/assets/returnTypes'

/* Query validator */
import { validateName, validateParameter, validateType, validateModifier } from '@/validation/query'

/* Handlers */
import { query } from '@/api/search'

/* Next router */
import { useRouter } from 'next/router'

/* Icons */
import { PlusCircleIcon } from '@heroicons/react/20/solid';

export default function Home() {
	const router = useRouter()

	// Form states
	const [methodName, setMethodName] = useState<string>('')
	const [returnType, setReturnType] = useState<string>('')
	const [parameters, setParameters] = useState<Array<{ name: string, type: string }>>([{ name: '', type: ''}])
	const [modifiers, setModifiers] = useState<string>('')
	const [searchType, setSearchType] = useState<{name: string, value: string}>({name: 'Method', value: 'method'})

	// Form error states
	const [methodNameError, setMethodNameError] = useState<string>('');
	const [returnTypeError, setReturnTypeError] = useState<string>('');
	const [parametersError, setParametersError] = useState<string>('');
	const [modifiersError, setModifiersError] = useState<string>('');

	// Boolean operators
	const [methodParamOperator, setMethodParamOperator] = useState<{name: string, value: string}>({name: 'OR', value: 'OR'});

	const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, errorSetter: React.Dispatch<React.SetStateAction<string>>) => {
		return (event: React.ChangeEvent<HTMLInputElement>) => {
			setter(event.target.value);
			errorSetter('');
		}
	}

	const generateQuery = () => {
		// Construct parameter part
		const parameterPart = parameters.map(({ type, name }) => {
			if (searchType.value === 'method') {
				if (type != '' && name != '') {
					return `${name}\$${type}`;
				}
			} else {
				if (name != '') {
					return `${name}`;
				}
			}
		}).join(',');

		// strip spaces from modifiers
		const modifiersPart = modifiers ? modifiers.replace(/\s/g, '') : '';

		let queryString;

		// Construct query string
		if (searchType.value === 'method') {
			queryString = `methodName:${methodName.toLowerCase()}`;
		} else {
			queryString = `className:${methodName.toLowerCase()}`;
		}

		if (returnType) {
			queryString += `;returnType:${returnType}`;
		}

		if (parameterPart) {
			if (searchType.value === 'method') {
				queryString += `;parameters:${parameterPart}`;
			} else {
				queryString += `;methods:${parameterPart}`;
			}
		}

		if (modifiersPart) {
			queryString += `;modifiers:${modifiersPart}`;
		}

		return queryString;
	}	

	const updateParameterName = (index: number, name: string) => {
		const newParameters = [...parameters]
		newParameters[index].name = name
		setParameters(newParameters)
	}

	const updateParameterType = (index: number, type: string) => {
		const newParameters = [...parameters]
		newParameters[index].type = type
		setParameters(newParameters)
	}

	const handleSearch = () => {
			// Validate method name
		// if (!validateName(methodName)) {
		// 	setMethodNameError("Invalid method name");
		// 	return;
		// }

		// Validate return type. Allow excluding return type
		// if (returnType && !validateType(returnType)) {
		// 	setReturnTypeError("Invalid return type");
		// 	return;
		// }

		// Validate parameters
		// if (!parameters.every(({ type, name }) => {
		// 	// Allow excluding parameters
		// 	if (!type && !name) {
		// 		return true;
		// 	}

		// 	return validateParameter(type, name);
		// })) {
		// 	setParametersError("One or more invalid parameters")
		// 	return;
		// }

		// Validate modifiers
		// if(modifiers) {
		// 	for (let modifier of modifiers.split(",")) {
		// 		if (!validateModifier(modifier)) {
		// 			setModifiersError("One or more invalid modifiers");
		// 			return;
		// 		}
		// 	}
		// }

		const queryString = generateQuery();

		const q = encodeURIComponent(queryString);
		router.push(`/search?q=${q}`)
	}

	return (
		<main
			className={`min-h-screen`}
		>
			<div className="h-screen w-full pattern-cross pattern-indigo-600 pattern-bg-primarybg pattern-size-8 pattern-opacity-10 fixed"></div>

			<div className='flex-col flex space-y-10 p-5 md:p-14 w-full items-center'>
				<div className='flex flex-col items-center'>
					<Image
						src='/logo.png'
						alt='Congenial System logo'
						width={150}
						height={150}
						className='rounded-xl'
					/>
					<div className='flex flex-col items-center justify-center'>
						<h1 className={`text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#b84cc3] via-[#5932a6] to-[#4621db] text-transparent bg-clip-text pb-1`}>
							{'Congenial System'}
						</h1>
						<h2 className='text-lg md:text-lg font-thin decoration-[#d732e4] decoration-2 text-gray-50 underline'>
							{'A Java search engine'}
						</h2>
					</div>
				</div>
				<div className='sm:w-full md:w-2/3 xl:w-1/2 space-y-5 bg-[#0b101a]/80 p-4 md:p-8 rounded-lg'>
					<div className='grid grid-cols-2 lg:grid-cols-4 gap-5 items-end'>
						<div className='col-span-1 lg:col-span-1'>
							<Dropdown
								label={"Search type"}
								selected={searchType}
								setSelected={setSearchType}
								alts={[{ name: "Method", value: "method" }, { name: "Class", value: "class" }]}
								className={""}
							/>
						</div>
						<div className='col-span-2 lg:col-span-3'>
							<Input
								label={searchType.value === 'method' ? "Method name" : "Class name"}
								className={""}
								value={methodName}
								onChange={handleInputChange(setMethodName, setMethodNameError)}
								placeholder={searchType.value === 'method' ? "E.g. 'bubbleSort'" : "E.g. 'ChessBoard'"}
								errorMessage={methodNameError}
							/>
						</div>
						{searchType.value === 'method' &&
							<div className='col-span-2'>
								<Input
									label="Return type"
									className={"w-full"}
									value={returnType}
									onChange={(e) => setReturnType(e.target.value)}
									placeholder="E.g. 'int[]'"
									errorMessage={returnTypeError}
								/>
							</div>
						}
						<div className='col-span-2'>
							<Input
								label="Modifiers (comma separated)"
								className={"w-full"}
								value={modifiers}
								onChange={(e) => setModifiers(e.target.value)}
								placeholder="E.g. 'public,static, ...'"
								errorMessage={modifiersError}
							/>
						</div>
					</div>
					<h3 className='text-md font-semibold text-white'>{searchType.value === 'method' ? 'Parameters' : 'Methods'}</h3>
					<div className='w-full space-y-5'>
						{Array.from({ length: parameters.length }, (_, i) => i).map((i) => {
							return (
								<div key={i} className='space-y-1'>
							<h3 className='text-xs font-medium text-white'>{searchType.value === 'method' ? `Parameter ${i+1}` : `Method ${i+1}`}</h3>
							<div className='grid grid-cols-2 gap-6'>
								<Input
									className={"w-full"}
									value={parameters[i]?.name}
									onChange={(e) => updateParameterName(i, e.target.value)}
									placeholder={searchType.value === 'method' ? "Parameter name" : "Method name"}
								/>
								{searchType.value === 'method' && 
									<Input
									className={"w-full"}
									value={parameters[i]?.type}
									onChange={(e) => updateParameterType(i, e.target.value)}
									placeholder="Parameter type"
									/>
								}
							</div>
						</div>
							)
						})}
						<Button
							title={searchType.value === 'method' ? "Add parameter" : "Add method"}
							className="w-full bg-transparent border-dashed border-indigo-600 hover:ring-0 hover:bg-white/5 border-[1px]"
							naked
							onClick={() => setParameters([...parameters, { name: '', type: '' }])}
							icon={<PlusCircleIcon className="w-5 h-5 mr-2" />}
						/>
					</div>
					
					<Button
						title="Search"
						className="float-right"
						onClick={handleSearch}
					/>
				</div>
			</div>
		</main>
	)
}
