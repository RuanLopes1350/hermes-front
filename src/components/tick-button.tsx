'use client';

import { useState } from 'react';

export default function TickButton() {
	const [isOn, setIsOn] = useState(false);

	const toggleSwitch = () => {
		setIsOn(!isOn);
	};

	return (
		<button
			onClick={toggleSwitch}
			className={`cursor-pointer border-2 rounded-full w-12 h-6 flex items-center transition-all duration-300 ${
				isOn
					? 'bg-[#BE9DFF] border-[#e6e0f0] justify-end'
					: 'bg-gray-700 border-gray-500 justify-start'
			}`}
		>
			<div
				className={`w-4.5 h-4.5 rounded-full transition-colors duration-300 ${
					isOn ? 'bg-[#3D0088]' : 'bg-gray-400'
				}`}
			></div>
		</button>
	);
}
