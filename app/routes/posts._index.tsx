import React from 'react';
import { Link, useLoaderData } from '@remix-run/react';
import type { LoaderFunction } from '@remix-run/node';
import { db } from '~/utils/db.server';

export const loader: LoaderFunction = async () => {
	// Server side loading
	const data = {
		posts: await db.post.findMany({
			take: 20,
			select: {
				id: true,
				title: true,
				createdAt: true,
			},
			orderBy: {
				createdAt: 'desc',
			},
		}),
	};

	return data;
};

const Index = () => {
	const { posts } = useLoaderData();
	return (
		<>
			<div className='page-header'>
				<h1>Posts</h1>
				<Link to='/posts/new' className='btn'>
					New Post
				</Link>
			</div>

			<ul className='posts-list'>
				{posts.map((post: any, index: number) => (
					<li key={index}>
						<Link to={`/posts/${post.id}`}>
							<h3>{post.title}</h3>
							<p>{new Date(post.createdAt).toLocaleString()}</p>
						</Link>
					</li>
				))}
			</ul>
		</>
	);
};

export default Index;
