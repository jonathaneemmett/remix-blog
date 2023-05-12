import { Link, useLoaderData } from '@remix-run/react';
import {
	redirect,
	type ActionFunction,
	type LoaderFunction,
} from '@remix-run/node';
import { db } from '~/utils/db.server';

export const loader: LoaderFunction = async ({ params }) => {
	const post = await db.post.findUnique({
		where: { id: params.postId },
	});

	if (!post) throw new Error('Post not found');

	return { post };
};

export const action: ActionFunction = async ({ request, params }) => {
	console.log(params);
	const form = await request.formData();
	if (form.get('_method') === 'delete') {
		const post = await db.post.findUnique({
			where: { id: params.postId },
		});

		if (!post) throw new Error('Post not found to delete');

		await db.post.delete({ where: { id: params.postId } });

		return redirect('/posts');
	}
};

const Post = () => {
	const { post } = useLoaderData();

	return (
		<div>
			<div className='page-header'>
				<h1>{post.title}</h1>
				<Link to='/posts' className='btn btn-reverse'>
					Back
				</Link>
			</div>
			<div className='page-content'>
				<p>{post.body}</p>
			</div>
			<div className='page-footer'>
				<form method='POST'>
					<input type='hidden' name='_method' value='delete' />
					<button className='btn btn-delete'>Delete</button>
				</form>
			</div>
		</div>
	);
};

export default Post;
