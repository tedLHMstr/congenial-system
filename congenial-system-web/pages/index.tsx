import React, { useState } from 'react'

/* Components */
import Input from '@/components/Input'
import Button from '@/components/Button'
import Dropdown from '@/components/Dropdown'

/* ReturnTypes */
import returnTypes from '@/assets/returnTypes'

/* Query validator */
import { validateName, validateParameter, validateType } from '@/validation/query'

/* Handlers */
import { query } from '@/api/search'

export default function Home() {
	const [methodName, setMethodName] = useState<string>('')
	// const [returnType, setReturnType] = useState<{ name: string, value: string }>(returnTypes[0])
	const [returnType, setReturnType] = useState<string>('')
	const [parameters, setParameters] = useState<Array<{ name: string, type: string }>>([{ name: '', type: ''}])
	const [modifiers, setModifiers] = useState<string>('')

	const [searchType, setSearchType] = useState<{name: string, value: string}>({name: 'Method', value: 'method'})

	// API response
	const [response, setResponse] = useState("");

	// Boolean operators
	const [methodParamOperator, setMethodParamOperator] = useState<{name: string, value: string}>({name: 'OR', value: 'OR'});

	const handleSearch = async () => {
		// Construct parameter part
		let parameterPart = '';
		parameters.forEach(obj => {
			if(obj.name === '' || obj.type === '') {
				return;
			}

			if(parameterPart !== '') {
				parameterPart += '-';
			}
			parameterPart += obj.name + ',' + obj.type
		})

		// Construct modifiers part
		let modifiersPart = modifiers.replaceAll(',', '-');

		// Construct query string
		let queryString = `methodName:${methodName}`;

		if(returnType !== '') {
			queryString += ` ${searchType.value === 'method' ? methodParamOperator.value : 'OR'} returnType:${returnType}`;
		}

		if(parameterPart !== '') {
			queryString += ` OR parameters:${parameterPart}`;
		}
		
		if(modifiersPart !== '') {
			queryString += ` OR modifiers:${modifiersPart}`;
		}
			
		const queryResponse = await query(queryString);

		setResponse(queryResponse.message);
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

	const search = () => {
		// Validate method name
		if(!validateName(methodName)) {
			console.log("Invalid methodname");
			return;
		}	

		// Validate return type. Allow excluding return type
		if(returnType !== '' && !validateType(returnType)) {
			console.log("Invalid return type");
			return;
		}

		// Validate parameters
		let validParameter = true;
		parameters.forEach(obj => {
			const type = obj.type;
			const name = obj.name;

			// Allow excluding parameters
			if(type === '' && name === '') {
				return;
			}

			if(!validateParameter(type, name)) {
				validParameter = false;
			}
		})

		if(!validParameter) {
			console.log("Invalid parameter");
			return;
		}

		// All checks passed, do a query
		handleSearch();
	}

	return (
		<main
			className={`min-h-screen`}
		>
			<div className="h-screen w-full pattern-cross pattern-indigo-600 pattern-bg-primarybg pattern-size-8 pattern-opacity-10 fixed"></div>
			<div className='flex-col flex space-y-10 p-10 md:p-24 w-full items-center'>
				<h1 className={`text-6xl font-bold text-center rounded-xl px-4 py-1 text-gray-100`}>
					Congenial System
				</h1><div>
				
    		</div>
				<div className='sm:w-full md:w-2/3 xl:w-1/2 space-y-5'>
					<Dropdown
						label={"Search type"}
						selected={searchType}
						setSelected={setSearchType}
						alts={[{ name: "Method", value: "method" }, { name: "Class", value: "class" }]}
						className={""}
					/>
					<div className='grid sm:grid-cols-1 md:grid-cols-3 gap-5'>
						<Input
							label="Method name"
							className={"w-full"}
							value={methodName}
							onChange={(e) => setMethodName(e.target.value)}
							placeholder="E.g. 'bubbleSort'"
						/>
						<div style={{ display: 'flex' }}>
							<Input
								label="Return type"
								className={"w-full"}
								value={returnType}
								onChange={(e) => setReturnType(e.target.value)}
								placeholder="E.g. 'int[]'"
							/>
						</div>
						<div style={{ display: 'flex' }}>
							{searchType.value === 'method' && <Dropdown
								label={"Operator between method name and return type(s)"}
								selected={methodParamOperator}
								setSelected={setMethodParamOperator}
								alts={[{ name: "OR", value: "OR" }, { name: "AND", value: "AND" }]}
								className={"w-full"}
							/>}
						</div>
						<div style={{ display: 'flex' }}>
							<Input
								label="Modifiers (comma separated)"
								className={"w-full"}
								value={modifiers}
								onChange={(e) => setModifiers(e.target.value)}
								placeholder="E.g. 'public,static, ...'"
							/>
						</div>
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
						onClick={search}
					/>
				</div>
			</div>
		</main>
	)
}
