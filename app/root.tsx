import {
	Outlet,
	LiveReload,
	Link,
	Links,
	Meta,
	isRouteErrorResponse,
	useRouteError,
	useLoaderData,
} from '@remix-run/react';
import type {
	LinksFunction,
	LoaderFunction,
	V2_MetaFunction,
} from '@remix-run/node';

import { getUser } from './utils/session.server';

import styles from '~/styles/global.css';

type Props = {
	title: string;
	children: React.ReactNode;
};

type LayoutProps = {
	children: React.ReactNode;
};

export const links: LinksFunction = () => {
	return [{ rel: 'stylesheet', href: styles }];
};

export const meta: V2_MetaFunction = () => {
	return [
		{
			description: 'Remix and friends.',
		},
	];
};

export const loader: LoaderFunction = async ({ request }) => {
	const user = await getUser(request);

	return { user };
};

export default function App() {
	return (
		<Document title='Remix Blog'>
			<Layout>
				<Outlet />
			</Layout>
		</Document>
	);
}

function Document({ children, title }: Props) {
	return (
		<html lang='en'>
			<head>
				<Meta />
				<title>{title ?? 'Test'}</title>
			</head>
			<Links />
			<body>
				{children}
				{process.env.NODE_ENV === 'development' && <LiveReload />}
			</body>
		</html>
	);
}

function Layout({ children }: LayoutProps) {
	const { user } = useLoaderData();
	return (
		<>
			<nav className='navbar'>
				<Link to='/' className='logo'>
					Remix
				</Link>
				<ul className='nav'>
					<li>
						<Link to='/posts'>Posts</Link>
					</li>
					{user ? (
						<li>
							<form action='/logout' method='POST'>
								<button className='btn ' type='submit'>
									Logout {user.username}
								</button>
							</form>
						</li>
					) : (
						<li>
							<Link to='/login'>Login</Link>
						</li>
					)}
				</ul>
			</nav>
			<div className='container'>{children}</div>
		</>
	);
}

export function ErrorBoundary() {
	const error = useRouteError();

	if (isRouteErrorResponse(error)) {
		return (
			<Document title='Error'>
				<Layout>
					<h1>
						{error.status} {error.statusText}
					</h1>
					<p>{error.data}</p>
				</Layout>
			</Document>
		);
	} else if (error instanceof Error) {
		return (
			<Document title='Error'>
				<Layout>
					<h1>Oops, There was a problem.</h1>
					<p>{error.message}</p>
				</Layout>
			</Document>
		);
	} else {
		return <h1>Unknown Error</h1>;
	}
}
