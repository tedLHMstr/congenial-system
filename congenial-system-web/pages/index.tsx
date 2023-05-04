import React, { useState } from 'react'

/* Components */
import Input from '@/components/Input'
import Button from '@/components/Button'
import Dropdown from '@/components/Dropdown'

/* ReturnTypes */
import returnTypes from '@/assets/returnTypes'

/* Query validator */
import { validateName, validateParameter, validateType, validateModifier } from '@/validation/query'

/* Handlers */
import { query } from '@/api/search'

/* Next router */
import { useRouter } from 'next/router'

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
		const parameterPart = parameters
			.filter(obj => obj.name && obj.type)
			.map(obj => `${obj.name},${obj.type}`)
			.join('-');

		// Construct modifiers part
		const modifiersPart = modifiers.replaceAll(',', '-');

		let queryString;

		// Construct query string
		if (searchType.value === 'method') {
			queryString = `methodName:${methodName}`;
		} else {
			queryString = `className:${methodName}`;
		}

		if (returnType) {
			queryString += ` ${searchType.value === 'method' ? methodParamOperator.value : 'OR'} returnType:${returnType}`;
		}

		if (parameterPart) {
			queryString += ` AND parameters:${parameterPart}`;
		}

		if (modifiersPart) {
			queryString += ` AND modifiers:${modifiersPart}`;
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
		if (!parameters.every(({ type, name }) => {
			// Allow excluding parameters
			if (!type && !name) {
				return true;
			}

			return validateParameter(type, name);
		})) {
			setParametersError("One or more invalid parameters")
			return;
		}

		// Validate modifiers
		if(modifiers) {
			for (let modifier of modifiers.split(",")) {
				if (!validateModifier(modifier)) {
					setModifiersError("One or more invalid modifiers");
					return;
				}
			}
		}

		const queryString = generateQuery();
		console.log(queryString);

		const q = encodeURIComponent(queryString);
		router.push(`/search?q=${q}`)
	}

	return (
		<main
			className={`min-h-screen`}
		>
			<div className="h-screen w-full pattern-cross pattern-indigo-600 pattern-bg-primarybg pattern-size-8 pattern-opacity-10 fixed"></div>

			<div className='flex-col flex space-y-10 p-5 md:p-24 w-full items-center'>
				<h1 className={`text-6xl font-bold text-center rounded-xl px-4 py-1 text-gray-100`}>
					Congenial System
				</h1>
				<div className='sm:w-full md:w-2/3 xl:w-1/2 space-y-5'>
					<Dropdown
						label={"Search type"}
						selected={searchType}
						setSelected={setSearchType}
						alts={[{ name: "Method", value: "method" }, { name: "Class", value: "class" }]}
						className={""}
					/>
					<div className='grid sm:grid-cols-1 md:grid-cols-3 gap-5 items-end'>
						<Input
							label={searchType.value === 'method' ? "Method name" : "Class name"}
							className={"w-full"}
							value={methodName}
							onChange={handleInputChange(setMethodName, setMethodNameError)}
							placeholder={searchType.value === 'method' ? "E.g. 'bubbleSort'" : "E.g. 'ChessBoard'"}
							errorMessage={methodNameError}
						/>
						<Input
							label="Return type"
							className={"w-full"}
							value={returnType}
							onChange={(e) => setReturnType(e.target.value)}
							placeholder="E.g. 'int[]'"
							errorMessage={returnTypeError}
						/>
						{searchType.value === 'method' && <Dropdown
							label={"Operator between method name and return type(s)"}
							selected={methodParamOperator}
							setSelected={setMethodParamOperator}
							alts={[{ name: "OR", value: "OR" }, { name: "AND", value: "AND" }]}
							className={"w-full"}
						/>}
						<Input
							label="Modifiers (comma separated)"
							className={"w-full"}
							value={modifiers}
							onChange={(e) => setModifiers(e.target.value)}
							placeholder="E.g. 'public,static, ...'"
							errorMessage={modifiersError}
						/>

					</div>
					{searchType.value == 'class' && (
						<h1 className='text-md font-semibold text-white'>{searchType.name}</h1>
					)	
					}
					<h3 className='text-md font-semibold text-white'>Parameters</h3>
					<div className='w-full space-y-5'>
						{Array.from({ length: parameters.length }, (_, i) => i).map((i) => {
							return (
								<div key={i} className='space-y-1'>
							<h3 className='text-xs font-medium text-white'>Parameter {i+1}</h3>
							<div className='grid grid-cols-2 gap-6'>
								<Input
									className={"w-full"}
									value={parameters[i]?.name}
									onChange={(e) => updateParameterName(i, e.target.value)}
									placeholder="Parameter name"
								/>
								<Input
									className={"w-full"}
									value={parameters[i]?.type}
									onChange={(e) => updateParameterType(i, e.target.value)}
									placeholder="Parameter type"
								/>
							</div>
						</div>
							)
						})}
						<Button
							title="+ Add parameter"
							className="w-full bg-transparent border-dashed hover:ring-0 hover:bg-white/5"
							onClick={() => setParameters([...parameters, { name: '', type: '' }])}
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
