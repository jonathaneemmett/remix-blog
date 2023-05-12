import { useActionData } from '@remix-run/react';
import type { ActionFunction } from '@remix-run/node';
import { redirect, json } from '@remix-run/node';
import { db } from '~/utils/db.server';
import { login, register, createUserSession } from '~/utils/session.server';

function validateUsername(username: string) {
	if (typeof username !== 'string' || username.length < 3)
		return 'Username should be atleast 3 characters';
}

function validatePassword(password: string) {
	if (typeof password !== 'string' || password.length < 6)
		return 'Password should be atleast 6 characters';
}

function badRequest(data: any) {
	return json(data, { status: 400 });
}

export const action: ActionFunction = async ({ request }) => {
	const form = await request.formData();
	const loginType = form.get('loginType') as string;
	const username = form.get('username') as string;
	const password = form.get('password') as string;

	const fields = { loginType, username, password };

	const fieldErrors = {
		username: validateUsername(username),
		password: validatePassword(password),
	};

	if (Object.values(fieldErrors).some(Boolean)) {
		return badRequest({ fieldErrors, fields });
	}

	switch (loginType) {
		case 'login': {
			const user = await login({ username, password });
			if (!user)
				return badRequest({
					fields,
					fieldErrors: { username: 'Invalid username or password.' },
				});

			return createUserSession(user.id, '/posts');
		}
		case 'register': {
			const user = await db.user.findFirst({
				where: { username },
			});

			if (user)
				return badRequest({
					fields,
					fieldErrors: { username: 'Username already exists.' },
				});

			const newUser = await register({ username, password });
			if (!newUser)
				return badRequest({ fields, formError: 'Unable to register.' });

			return createUserSession(newUser.id, '/posts');
		}
		default:
			return badRequest({ fields, formError: 'Invalid login type.' });
	}
};

const Login = () => {
	const actionData = useActionData();

	return (
		<div className='auth-container'>
			<div className='page-header'>
				<h1>Login</h1>
			</div>
			<div className='page-content'>
				<form method='POST'>
					<fieldset>
						<legend>Login or Register</legend>
						<label>
							<input
								type='radio'
								name='loginType'
								id='loginType'
								value='login'
								defaultChecked={
									!actionData?.fields?.loginType ||
									actionData?.fields?.loginType === 'login'
								}
							/>
							Login
						</label>
						<label>
							<input
								type='radio'
								name='loginType'
								id='loginType'
								value='register'
							/>
							Register
						</label>
					</fieldset>
					<div className='form-control'>
						<label htmlFor='username'>Username</label>
						<input
							type='text'
							name='username'
							id='username'
							defaultValue={actionData?.fields?.username}
						/>
						<div className='error'>
							{actionData?.fieldErrors?.username &&
								actionData?.fieldErrors?.username}
						</div>
					</div>
					<div className='form-control'>
						<label htmlFor='password'>Password</label>
						<input
							type='password'
							name='password'
							id='password'
							defaultValue={actionData?.fields?.password}
						/>
						<div className='error'>
							{actionData?.fieldErrors?.password &&
								actionData?.fieldErrors?.password}
						</div>
					</div>
					<button type='submit' className='btn btn-block'>
						Submit
					</button>
				</form>
				<div className='error'>
					{actionData?.formError && actionData?.formError}
				</div>
			</div>
		</div>
	);
};

export default Login;
