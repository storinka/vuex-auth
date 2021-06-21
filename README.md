# Storinka Vuex Auth

A Vuex module and Vue Router middleware for authorization.

## Installation

```shell
yarn add @storinka/vuex-auth
```

## Usage

```javascript
// store/index.js

import { createStore } from "vuex";
import { createAuthStoreModule } from "@storinka/vuex-auth";

export default createStore({
    modules: {
        auth: createAuthStoreModule({
            signIn: credentials => fetch("auth/signIn", credentials),
            signUp: data => fetch("auth/signUp", data),
            getMe: () => fetch("auth/getMe"),
            logout: () => fetch("auth/logout"),

            tokenKey: "auth_token",
        }),
    }
});
```

```javascript
// App.vue

import { initAuth, setupRouterGuard } from "@storinka/vuex-auth";

export default {
    beforeCreate() {
        initAuth(this.$router, this.$store);
        setupRouterGuard(this.$router, this.$store);
    }
}
```
