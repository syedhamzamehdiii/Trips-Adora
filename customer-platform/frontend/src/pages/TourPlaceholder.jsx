import React from 'react';
import { useLocation } from 'react-router-dom';

const TourPlaceholder = () => {
	const location = useLocation();
	return (
		<div className="min-h-[60vh] flex items-center justify-center">
			<div className="text-center px-6 py-8">
				<h1 className="text-2xl font-bold text-[#302E2E]">Coming Soon</h1>
				<p className="text-[#6b7280] mt-2">{location.pathname}</p>
			</div>
		</div>
	);
};

export default TourPlaceholder;
