import { Link } from '@remix-run/react';
import { redirect } from '@remix-run/node';
import type { ActionArgs, ActionFunction } from '@remix-run/node';
import { db } from '~/utils/db.server';

export const action: ActionFunction = async ({ request }: ActionArgs) => {
	const form = await request.formData();
	const title = form.get('title')?.toString();
	const body = form.get('body')?.toString();

	// Simple validation
	if (!title || !body) throw new Error('Please fill out all fields');

	// Create the post
	const post = await db.post.create({ data: { title, body } });

	return redirect(`/posts/${post.id}`);
};

const NewPost = () => {
	return (
		<>
			<div className='page-header'>
				New Post
				<Link to='/posts' className='btn btn-reverse'>
					Back
				</Link>
			</div>
			<div className='page-content'>
				<form method='post'>
					<div className='form-control'>
						<label htmlFor='title'>Title</label>
						<input type='text' name='title' id='title' />
					</div>
					<div className='form-control'>
						<label htmlFor='body'>Post Body</label>
						<textarea name='body' id='body' />
					</div>
					<button type='submit' className='btn btn-block'>
						Add Post
					</button>
				</form>
			</div>
		</>
	);
};

export default NewPost;
