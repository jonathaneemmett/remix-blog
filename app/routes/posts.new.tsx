import { Link, useActionData } from '@remix-run/react';
import { redirect, json } from '@remix-run/node';
import type { ActionArgs, ActionFunction } from '@remix-run/node';
import { db } from '~/utils/db.server';
import { getUser } from '~/utils/session.server';

function badRequest(data: any) {
	return json(data, { status: 400 });
}

function validateTitle(title: string) {
	if (typeof title !== 'string' || title.length < 3)
		return 'Title should be atleast 3 characters';
}

function validateBody(body: string) {
	if (typeof body !== 'string' || body.length < 10)
		return 'Body should be atleast 10 characters';
}

export const action: ActionFunction = async ({ request }: ActionArgs) => {
	const form = await request.formData();
	const title = form.get('title') as string;
	const body = form.get('body') as string;
	const user = await getUser(request);

	const fields = { title, body };

	const fieldErrors = {
		title: validateTitle(title),
		body: validateBody(body),
	};

	if (Object.values(fieldErrors).some(Boolean)) {
		console.log(fieldErrors);

		return badRequest({ fieldErrors, fields });
	}

	// Create the post
	const post = await db.post.create({
		data: { title, body, userId: user?.id },
	});

	return redirect(`/posts/${post.id}`);
};

const NewPost = () => {
	const actionData = useActionData();

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
						<input
							type='text'
							name='title'
							id='title'
							defaultValue={actionData?.fields?.title}
						/>
						<div className='error'>
							<p>
								{actionData?.fieldErrors?.title &&
									actionData?.fieldErrors?.title}
							</p>
						</div>
					</div>
					<div className='form-control'>
						<label htmlFor='body'>Post Body</label>
						<textarea
							name='body'
							id='body'
							defaultValue={actionData?.fields?.body}
						/>
						<div className='error'>
							<p>
								{actionData?.fieldErrors?.body &&
									actionData?.fieldErrors?.body}
							</p>
						</div>
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
