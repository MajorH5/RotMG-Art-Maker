export const Auth = (function () {
    return class Auth {
        static async signIn (email, password) {
            const response = await fetch('http://localhost:8080/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            return response.json();
        }

        static async signOut (token) {
            const response = await fetch('http://localhost:8080/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token
                })
            });

            return response.json();
        }

        static async register (username, email, password) {
            const response = await fetch('http://localhost:8080/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    email,
                    password
                })
            });

            return response.json();
        }

        static setCookie (name, value, days) {
            let expires = '';
            if (days) {
                const date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = `; expires=${date.toUTCString()}`;
            }
            document.cookie = `${name}=${value || ''}${expires}; path=/`;
        }

        static getCookie (name) {
            const nameEQ = `${name}=`;
            const ca = document.cookie.split(';');
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) === ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
            }
            return null;
        }

        static eraseCookie (name) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }

        static encodeUser (user) {
            return btoa(JSON.stringify(user));
        }

        static decodeUser (user) {
            return JSON.parse(atob(user));
        }

        static validatePassword (password) {
            const MIN_PASSWORD_LENGTH = 8;
            const MAX_PASSWORD_LENGTH = 64;

            if (typeof password !== 'string') return 'Password must be a string';
            if (password.length === 0) return 'Please enter a password';
            if (password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) return `Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters long`;
    
            return true;
        }

        static validateEmail (email) {
            const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

            if (typeof email !== 'string') return 'Email must be a string';
            if (email.length === 0) return 'Please enter an email';
            if (!EMAIL_REGEX.test(email)) return 'Invalid email format';
    
            return true;
        }

        static validateUsername (username) {
            const MIN_USERNAME_LENGTH = 3;
            const MAX_USERNAME_LENGTH = 16;
            const ALLOWED_USERNAME_CHARACTERS = /^[a-zA-Z0-9_]+$/;

            if (typeof username !== 'string') return 'Username must be a string';
            if (username.length === 0) return 'Please enter a username';
            if (username.length < MIN_USERNAME_LENGTH || username.length > MAX_USERNAME_LENGTH) return `Username must be between ${MIN_USERNAME_LENGTH} and ${MAX_USERNAME_LENGTH} characters long`;
            if (!ALLOWED_USERNAME_CHARACTERS.test(username)) return 'Username can only contain letters, numbers, and underscores';
    
            return true;
        }
    }
})();