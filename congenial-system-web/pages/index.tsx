import React, { useState } from 'react'

/* Components */
import Input from '@/components/Input'
import Button from '@/components/Button'
import Dropdown from '@/components/Dropdown'

/* ReturnTypes */
import returnTypes from '@/assets/returnTypes'


export default function Home() {
	const [methodName, setMethodName] = useState<string>('')
	// const [returnType, setReturnType] = useState<{ name: string, value: string }>(returnTypes[0])
	const [returnType, setReturnType] = useState<string>('')
	const [parameters, setParameters] = useState<Array<{ name: string, type: string }>>([{ name: '', type: ''}])

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
		console.log(methodName, returnType, parameters)
	}

	return (
		<main
			className={`min-h-screen`}
		>
			<div className="h-screen w-full pattern-cross pattern-indigo-600 pattern-bg-primarybg pattern-size-8 pattern-opacity-10 fixed"></div>
			<div className='flex-col flex space-y-10 p-10 md:p-24 w-full items-center'>
				<h1 className={`text-6xl font-bold text-center rounded-xl px-4 py-1 text-gray-100`}>
					Congenial System
				</h1>

				<div className='sm:w-full md:w-2/3 xl:w-1/2 space-y-5'>
					<div className='grid sm:grid-cols-1 md:grid-cols-2 gap-5'>
						<Input
							label="Method name"
							className={"w-full"}
							value={methodName}
							onChange={(e) => setMethodName(e.target.value)}
							placeholder="For example: 'bubbleSort'"
						/>
						<Input
							label="Return type"
							className={"w-full"}
							value={returnType}
							onChange={(e) => setReturnType(e.target.value)}
							placeholder="For example: 'int[]'"
						/>
					</div>

					{/* <div className='w-full grid grid-cols-2 gap-6'>
						<Dropdown
							label={"Return type"}
							selected={returnType}
							setSelected={setReturnType}
							className={""}
							alts={returnTypes}
						/>
						<Dropdown
							label={"Return type"}
							selected={returnType}
							setSelected={setReturnType}
							className={""}
							alts={[
								{ name: "JavaScript", value: "javascript" },
								{ name: "TypeScript", value: "typescript" },
								{ name: "Python", value: "python" },
								{ name: "Java", value: "java" },
								{ name: "C++", value: "cpp" },
								{ name: "C#", value: "csharp" },
								{ name: "Go", value: "go" },
								{ name: "Rust", value: "rust" },
								{ name: "Ruby", value: "ruby" },
								{ name: "PHP", value: "php" },
								{ name: "Swift", value: "swift" },
								{ name: "Kotlin", value: "kotlin" },
								{ name: "Scala", value: "scala" },
								{ name: "R", value: "r" }
							]}
						/>
					</div> */}

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
