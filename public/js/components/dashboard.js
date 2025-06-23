const Dashboard = {
    template: /*HTML*/ `
        <div class="page-content">
            <div class="page-header">
                <div>
                    <h2>Dashboard</h2>
                    <p class="text-muted">Panel de control</p>
                </div>
            </div>

            <!-- Esta cargando -->
            <div v-if="loading" class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-body text-center py-5">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Cargando estadísticas...</span>
                            </div>
                            <p class="text-muted mt-3">Cargando información del dashboard...</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Dashboard content -->
            <div v-else>
                <!-- Welcome Card -->
                <div class="row mb-4">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-body text-center py-4">
                                <i class="fas fa-chart-line fa-3x text-primary mb-3"></i>
                                <h4>{{ welcomeMessage }}</h4>
                                <p class="text-muted">
                                    {{ dashboardDescription }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Statistics Cards for Admin -->
                <div v-if="user.role === 'admin'" class="row">
                    <div class="col-lg-4 col-md-6 mb-4">
                        <div class="card h-100">
                            <div class="card-body text-center">
                                <div class="d-flex align-items-center justify-content-center mb-3">
                                    <div class="bg-primary bg-opacity-10 rounded-circle p-3">
                                        <i class="fas fa-users fa-2x text-primary"></i>
                                    </div>
                                </div>
                                <h3 class="card-title mb-2">{{ statistics.totalUsers || 0 }}</h3>
                                <p class="card-text text-muted">Usuarios Registrados</p>
                                <small class="text-muted">
                                    <i class="fas fa-info-circle"></i>
                                    Total de usuarios en la plataforma
                                </small>
                            </div>
                        </div>
                    </div>

                    <div class="col-lg-4 col-md-6 mb-4">
                        <div class="card h-100">
                            <div class="card-body text-center">
                                <div class="d-flex align-items-center justify-content-center mb-3">
                                    <div class="bg-success bg-opacity-10 rounded-circle p-3">
                                        <i class="fas fa-file-alt fa-2x text-success"></i>
                                    </div>
                                </div>
                                <h3 class="card-title mb-2">{{ statistics.totalDocuments || 0 }}</h3>
                                <p class="card-text text-muted">Documentos Subidos</p>
                                <small class="text-muted">
                                    <i class="fas fa-info-circle"></i>
                                    Total de archivos en el sistema
                                </small>
                            </div>
                        </div>
                    </div>

                    <div class="col-lg-4 col-md-6 mb-4">
                        <div class="card h-100">
                            <div class="card-body text-center">
                                <div class="d-flex align-items-center justify-content-center mb-3">
                                    <div class="bg-info bg-opacity-10 rounded-circle p-3">
                                        <i class="fas fa-hdd fa-2x text-info"></i>
                                    </div>
                                </div>
                                <h3 class="card-title mb-2">{{ formatFileSize(statistics.totalSize || 0) }}</h3>
                                <p class="card-text text-muted">Espacio Utilizado</p>
                                <small class="text-muted">
                                    <i class="fas fa-info-circle"></i>
                                    Tamaño total de todos los archivos
                                </small>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Statistics Cards for User -->
                <div v-else class="row">
                    <div class="col-lg-6 col-md-6 mb-4">
                        <div class="card h-100">
                            <div class="card-body text-center">
                                <div class="d-flex align-items-center justify-content-center mb-3">
                                    <div class="bg-success bg-opacity-10 rounded-circle p-3">
                                        <i class="fas fa-file-alt fa-2x text-success"></i>
                                    </div>
                                </div>
                                <h3 class="card-title mb-2">{{ statistics.userDocuments || 0 }}</h3>
                                <p class="card-text text-muted">Mis Documentos</p>
                                <small class="text-muted">
                                    <i class="fas fa-info-circle"></i>
                                    Total de archivos que has subido
                                </small>
                            </div>
                        </div>
                    </div>

                    <div class="col-lg-6 col-md-6 mb-4">
                        <div class="card h-100">
                            <div class="card-body text-center">
                                <div class="d-flex align-items-center justify-content-center mb-3">
                                    <div class="bg-info bg-opacity-10 rounded-circle p-3">
                                        <i class="fas fa-hdd fa-2x text-info"></i>
                                    </div>
                                </div>
                                <h3 class="card-title mb-2">{{ formatFileSize(statistics.userTotalSize || 0) }}</h3>
                                <p class="card-text text-muted">Mi Espacio Utilizado</p>
                                <small class="text-muted">
                                    <i class="fas fa-info-circle"></i>
                                    Tamaño total de tus archivos
                                </small>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Error state -->
                <div v-if="error" class="row">
                    <div class="col-12">
                        <div class="alert alert-warning" role="alert">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            <strong>Error al cargar estadísticas:</strong> {{ error }}
                            <button @click="loadStatistics" class="btn btn-sm btn-outline-warning ms-3">
                                <i class="fas fa-redo"></i> Reintentar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    props: {
        user: {
            type: Object,
            required: true
        }
    },
    setup(props) {
        const { ref, computed, onMounted } = Vue;

        /* Estado reactivo */
        const statistics = ref({});
        const loading = ref(true);
        const error = ref(null);

        const welcomeMessage = computed(() => {
            return props.user.role === 'admin'
                ? 'Panel de Administración'
                : 'Mi Panel Personal';
        });

        const dashboardDescription = computed(() => {
            return props.user.role === 'admin'
                ? 'Estadísticas generales del sistema, usuarios y documentos.'
                : 'Estado de tus documentos.';
        });

        /* Cargar estadísticas */
        const loadStatistics = async () => {
            try {
                loading.value = true;
                error.value = null;

                const endpoint = props.user.role === 'admin'
                    ? '/api/admin/statistics'
                    : '/api/user/statistics';

                const response = await apiFetch(endpoint);

                if (response.ok) {
                    const data = await response.json();
                    statistics.value = data;
                } else {
                    throw new Error('Error al cargar las estadísticas');
                }
            } catch (err) {
                console.error('Error:', err);
                error.value = err.message || 'Error de conexión';
            } finally {
                loading.value = false;
            }
        };

        /* Refrescar estadísticas */
        const refreshStatistics = async () => {
            await loadStatistics();
            showAlert('Estadísticas actualizadas', 'success');
        };


        /* Utilidades */
        const formatFileSize = (bytes) => {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        };

        const showAlert = (message, type = 'info') => {
            const alertClass = {
                'success': 'alert-success',
                'danger': 'alert-danger',
                'warning': 'alert-warning',
                'info': 'alert-info'
            };

            const alertDiv = document.createElement('div');
            alertDiv.className = `alert ${alertClass[type]} alert-dismissible fade show position-fixed`;
            alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
            alertDiv.innerHTML = `
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;

            document.body.appendChild(alertDiv);

            setTimeout(() => {
                if (alertDiv.parentNode) {
                    alertDiv.parentNode.removeChild(alertDiv);
                }
            }, 3000);
        };

        /* Cargar estadísticas al montar */
        onMounted(() => {
            loadStatistics();
        });

        return {
            statistics,
            loading,
            error,
            welcomeMessage,
            dashboardDescription,
            loadStatistics,
            refreshStatistics,
            formatFileSize
        };
    }
};