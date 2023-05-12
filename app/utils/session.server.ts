import bcrypt from 'bcrypt';
import { db } from './db.server';
import { createCookieSessionStorage, redirect } from '@remix-run/node';

export interface RegisterLogin {
	username: string;
	password: string;
}

export async function login({ username, password }: RegisterLogin) {
	const user = await db.user.findUnique({
		where: { username },
	});

	if (!user) return null;

	// check the password
	const isPasswordValid = await bcrypt.compare(password, user.password);

	if (!isPasswordValid) return null;

	return user;
}

// Register New User
export async function register({ username, password }: RegisterLogin) {
	const hashedPassword = await bcrypt.hash(password, 10);

	return db.user.create({
		data: {
			username,
			password: hashedPassword,
		},
	});
}

// Get session secret
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) throw new Error('No session secret found.');

// Create session storage
const storage = createCookieSessionStorage({
	cookie: {
		name: 'remixblog_session',
		secure: process.env.NODE_ENV === 'production',
		secrets: [sessionSecret],
		sameSite: 'lax',
		path: '/',
		maxAge: 60 * 60 * 24 * 60, // 60 days
		httpOnly: true,
	},
});

// Create session
export async function createUserSession(userId: string, redirectTo: string) {
	const session = await storage.getSession();
	session.set('userId', userId);

	return redirect(redirectTo, {
		headers: {
			'Set-Cookie': await storage.commitSession(session),
		},
	});
}

// Get user session
export async function getUserSession(request: Request) {
	return storage.getSession(request.headers.get('Cookie'));
}

// Get logged in user
export async function getUser(request: Request) {
	const session = await getUserSession(request);
	const userId = session.get('userId');
	if (!userId || typeof userId !== 'string') return null;

	try {
		const user = await db.user.findUnique({
			where: { id: userId },
		});

		return user;
	} catch (error) {
		return null;
	}
}

// Logout User
export async function logout(request: Request) {
	const session = await storage.getSession(request.headers.get('Cookie'));

	return redirect('/logout', {
		headers: {
			'Set-Cookie': await storage.destroySession(session),
		},
	});
}
