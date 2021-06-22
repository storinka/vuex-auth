const defaultTokenKey = "auth_token";
const defaultLoginRoute = "/login";
const defaultMainRoute = "/";

type CommitFn = (mutation: any, args?: any) => any;

interface AuthResult {
    user: any;
    token: string;
}

interface AuthStoreConfig {
    login: (credentials: any) => Promise<AuthResult>;
    register: (data: any) => Promise<AuthResult>;
    getMe: () => Promise<any>;
    logout: () => Promise<any>;

    storageTokenKey?: string;
    loginRoute?: string;
    mainRoute?: string;
}

interface AuthState {
    isLoadingUser: boolean;
    isLoggingOut: boolean;
    isLogging: boolean;
    isRegistering: boolean;

    user?: any;
    token?: null | string;
}

export function createAuthStoreModule(config: AuthStoreConfig) {
    if (!config.storageTokenKey) {
        config.storageTokenKey = defaultTokenKey;
    }
    if (!config.loginRoute) {
        config.loginRoute = defaultLoginRoute;
    }
    if (!config.mainRoute) {
        config.mainRoute = defaultMainRoute;
    }

    return {
        namespaced: true,

        state: {
            isLoadingUser: false,
            isLoggingOut: false,
            isLogging: false,
            isRegistering: false,

            user: null,
            token: localStorage.getItem(config.storageTokenKey),

            config,
        },
        getters: {
            isReady({ isLoadingUser }: AuthState) {
                return !isLoadingUser;
            },
            isAuthorized({ user }: AuthState) {
                return !!user;
            }
        },
        mutations: {
            login(state: AuthState, { user, token }: AuthResult) {
                // @ts-ignore
                localStorage.setItem(config.storageTokenKey, token);

                state.user = user;
                state.token = token;
            },
            logout(state: AuthState) {
                state.user = null;
                state.token = null;

                // @ts-ignore
                localStorage.removeItem(config.storageTokenKey);
            }
        },
        actions: {
            init({ commit, state }: { commit: CommitFn, state: AuthState }) {
                if (state.token) {
                    state.isLoadingUser = true;

                    return config.getMe()
                        .then(user => {
                            commit("login", {
                                user,
                                token: state.token
                            });

                            return user;
                        })
                        .finally(() => {
                            state.isLoadingUser = false;
                        });
                } else {
                    return Promise.resolve();
                }
            },
            login({ commit, state }: { commit: CommitFn, state: AuthState }, credentials: any) {
                return config.login(credentials)
                    .then(auth => {
                        commit("login", auth);

                        return auth;
                    })
                    .finally(() => {
                        state.isLogging = false;
                    });
            },
            register({ commit, state }: { commit: CommitFn, state: AuthState }, data: any) {
                state.isLogging = true;

                return config.register(data)
                    .then(auth => {
                        commit("login", auth);

                        return auth;
                    })
                    .finally(() => {
                        state.isLogging = false;
                    });
            },
            logout({ commit, state }: { commit: CommitFn, state: AuthState }) {
                state.isLoggingOut = true;

                return config.logout()
                    .then(result => {
                        commit("logout");

                        return result;
                    })
                    .finally(() => {
                        state.isLoggingOut = false;
                    });
            }
        }
    };
}

export function setupRouterGuard(
    $router: any,
    $store: any
) {
    $router.beforeEach((to: any, from: any, next: any) => {
        const { mainRoute, loginRoute } = $store.state.auth.config;

        if ($store.getters["auth/isReady"]) {
            if ($store.getters["auth/isAuthorized"]) {
                if (to.meta.guest) {
                    return next(mainRoute);
                }
            } else {
                if (!to.meta.guest) {
                    return next(`${loginRoute}?to=${encodeURI(to.path)}`);
                }
            }
        }

        return next();
    });
}

export function initAuth(
    $router: any,
    $store: any
) {
    $store.dispatch("auth/init")
        .then((user: any) => {
            if (user) {
                const { mainRoute } = $store.state.auth.config;

                if ($router.currentRoute.meta.guest) {
                    $router.replace(mainRoute)
                }
            }
        })
}
