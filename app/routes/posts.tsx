import { Outlet } from '@remix-run/react';
import React from 'react';

const Posts = () => {
	return (
		<div>
			<Outlet />
		</div>
	);
};

export default Posts;
