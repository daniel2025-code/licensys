const MainLayout = {
    components: {
        Dashboard,
        Users,
        MyDocuments,
        Documents
    },
    template: /*HTML*/ `
        <div class="main-layout">
            <!-- Header -->
            <header class="main-header">
                <h1 class="h4 mb-0">LicenSys</h1>
                <div class="d-flex align-items-center">
                    <span class="me-3 header-user">{{ user.name }} ({{ user.role }})</span>
                    <button @click="logout" class="btn btn-outline-danger btn-sm">
                        <i class="fas fa-sign-out-alt"></i> Cerrar sesión
                    </button>
                </div>
            </header>

            <div class="main-content-wrapper">
                <!-- Sidebar -->
                <nav class="sidebar">
                    <ul class="sidebar-nav">
                        <li class="nav-item">
                            <p @click.prevent="setActiveTab('dashboard')" :class="['nav-link', { active: activeTab === 'dashboard' }]">
                                <i class="fas fa-tachometer-alt"></i>
                                Dashboard
                            </p>
                        </li>

                        <li class="nav-item" v-if="user.role === 'admin'">
                            <p @click.prevent="setActiveTab('users')" :class="['nav-link', { active: activeTab === 'users' }]">
                                <i class="fas fa-users"></i>
                                Usuarios
                            </p>
                        </li>

                        <li class="nav-item">
                            <p @click.prevent="setActiveTab('my-documents')" :class="['nav-link', { active: activeTab === 'my-documents' }]">
                                <i class="fa-solid fa-file-contract"></i>
                                Mis Documentos
                            </p>
                        </li>

                        <li class="nav-item" v-if="user.role === 'admin'">
                            <p @click.prevent="setActiveTab('documents')" :class="['nav-link', { active: activeTab === 'documents' }]">
                                <i class="fas fa-file-alt"></i>
                                Documentos
                            </p>
                        </li>
                    </ul>
                </nav>

                <!-- Main Content -->
                <main class="main-content">
                    <transition name="fade" mode="out-in">
                        <Dashboard v-if="activeTab === 'dashboard'" :user="user" />
                        <Users v-else-if="activeTab === 'users'" />
                        <MyDocuments v-else-if="activeTab === 'my-documents'" />
                        <Documents v-else-if="activeTab === 'documents'" />
                    </transition>
                </main>
            </div>
        </div>
    `,
    props: {
        user: {
            type: Object,
            required: true
        },
        onLogout: {
            type: Function,
            required: true
        }
    },
    setup(props) {
        const activeTab = Vue.ref('dashboard');

        function setActiveTab(tab) {
            activeTab.value = tab;
        }

        function logout() {
            props.onLogout();
        }

        return {
            activeTab,
            setActiveTab,
            logout
        };
    }
};