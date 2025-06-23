const Login = {
    template: /*HTML*/ `
        <div class="login-container">
            <form @submit.prevent="handleLogin" class="login-form">
                <h2 class="login-title">LicenSys</h2>

                <div class="mb-3">
                    <label class="form-label">Usuario:</label>
                    <input v-model="username" class="form-control" type="text" required />
                </div>

                <div class="mb-3">
                    <label class="form-label">Contraseña:</label>
                    <input v-model="password" type="password" class="form-control" required />
                </div>

                <button type="submit" class="btn btn-primary">Ingresar</button>
                <div v-if="errorMessage" class="text-danger mt-2">{{ errorMessage }}</div>
            </form>
        </div>
    `,
    props: {
        onLoginSuccess: {
            type: Function,
            required: true
        }
    },
    setup(props) {
        const username = Vue.ref("");
        const password = Vue.ref("");
        const errorMessage = Vue.ref("");

        async function handleLogin() {
            errorMessage.value = "";

            const response = await apiFetch("/api/auth/login", "POST", {
                username: username.value,
                password: password.value
            });

            if (response.ok) {
                const user = await response.json();
                localStorage.setItem("user", JSON.stringify(user));
                props.onLoginSuccess(user);
            } else {
                errorMessage.value = "Credenciales incorrectas";
            }
        }

        return {
            username,
            password,
            handleLogin,
            errorMessage
        };
    }
}