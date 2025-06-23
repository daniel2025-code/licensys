const Documents = {
    template: /*HTML*/ `
        <div class="page-content">
            <div class="page-header">
                <div>
                    <h2>Gestión de Documentos</h2>
                    <p class="text-muted">Documentos subidos por los usuarios</p>
                </div>
                <div v-if="selectedUser">
                    <button class="btn btn-secondary me-2" @click="goBackToUsers">
                        <i class="fa-solid fa-arrow-left"></i> Volver a usuarios
                    </button>
                    <button class="btn btn-primary" @click="openUploadModal">
                        <i class="fa-solid fa-upload"></i> Subir archivo para {{ selectedUser.name }}
                    </button>
                </div>
            </div>

            <div class="page-body">
                <!-- Vista de usuarios (carpetas) -->
                <div v-if="!selectedUser">
                    <!-- Buscador -->
                    <div class="card mb-4">
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="input-group">
                                        <span class="input-group-text">
                                            <i class="fa-solid fa-search"></i>
                                        </span>
                                        <input
                                            type="text"
                                            class="form-control"
                                            placeholder="Buscar por nombre o RUT..."
                                            v-model="searchQuery"
                                            @input="debouncedSearch"
                                        />
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="text-muted">
                                        Mostrando {{ filteredUsers.length }} de {{ users.length }} usuarios
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Lista de usuarios -->
                    <div class="card">
                        <div class="card-body">
                            <div v-if="loadingUsers" class="text-center py-4">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">Cargando usuarios...</span>
                                </div>
                            </div>
                            <div v-else-if="filteredUsers.length === 0" class="text-center py-4">
                                <i class="fa-solid fa-users fa-3x text-muted mb-3"></i>
                                <h5 class="text-muted">No se encontraron usuarios</h5>
                                <p class="text-muted">
                                    {{ searchQuery ? 'No hay usuarios que coincidan con tu búsqueda' : 'No hay usuarios registrados' }}
                                </p>
                            </div>
                            <div v-else class="row">
                                <div 
                                    v-for="user in filteredUsers" 
                                    :key="user.id" 
                                    class="col-lg-4 col-md-6 mb-3"
                                >
                                    <div 
                                        class="card user-folder h-100" 
                                        @click="selectUser(user)"
                                        style="cursor: pointer; transition: transform 0.2s;"
                                        @mouseenter="$event.target.style.transform = 'translateY(-2px)'"
                                        @mouseleave="$event.target.style.transform = 'translateY(0)'"
                                    >
                                        <div class="card-body text-center">
                                            <i class="fa-solid fa-folder fa-3x text-primary mb-3"></i>
                                            <h6 class="card-title mb-1">{{ user.name }}</h6>
                                            <p class="card-text text-muted small mb-2">
                                                <strong>Usuario:</strong> {{ user.username }}<br>
                                                <strong>RUT:</strong> {{ user.rut }}<br>
                                                <span class="badge" :class="user.role === 'admin' ? 'bg-danger' : 'bg-secondary'">
                                                    {{ user.role === 'admin' ? 'Administrador' : 'Usuario' }}
                                                </span>
                                            </p>
                                            <small class="text-muted">
                                                <i class="fa-solid fa-mouse-pointer"></i> Click para ver documentos
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Vista de documentos del usuario seleccionado -->
                <div v-else>
                    <!-- Info del usuario seleccionado -->
                    <div class="card mb-4">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <i class="fa-solid fa-user-circle fa-2x text-primary me-3"></i>
                                <div>
                                    <h5 class="mb-1">{{ selectedUser.name }}</h5>
                                    <p class="text-muted mb-0">
                                        <strong>Usuario:</strong> {{ selectedUser.username }} | 
                                        <strong>RUT:</strong> {{ selectedUser.rut }} |
                                        <span class="badge" :class="selectedUser.role === 'admin' ? 'bg-danger' : 'bg-secondary'">
                                            {{ selectedUser.role === 'admin' ? 'Administrador' : 'Usuario' }}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Tabla de documentos -->
                    <div class="card">
                        <div class="card-body">
                            <div v-if="loadingDocuments" class="text-center py-4">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">Cargando documentos...</span>
                                </div>
                            </div>
                            <div v-else-if="userDocuments.length === 0" class="text-center py-4">
                                <i class="fa-solid fa-folder-open fa-3x text-muted mb-3"></i>
                                <h5 class="text-muted">No hay documentos</h5>
                                <p class="text-muted">Este usuario no tiene documentos subidos</p>
                            </div>
                            <div v-else class="table-responsive">
                                <table class="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Nombre</th>
                                            <th>Descripción</th>
                                            <th>Tamaño</th>
                                            <th>Fecha</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="doc in userDocuments" :key="doc.id">
                                            <td>
                                                <div class="d-flex align-items-center">
                                                    <i :class="getFileIcon(doc.filename)" class="me-2"></i>
                                                    <span>{{ doc.filename }}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span v-if="!doc.editing">{{ doc.description || 'Sin descripción' }}</span>
                                                <input
                                                    v-else
                                                    v-model="doc.tempDescription"
                                                    @keyup.enter="saveDescription(doc)"
                                                    @keyup.escape="cancelEdit(doc)"
                                                    class="form-control form-control-sm"
                                                    :placeholder="doc.description || 'Agregar descripción'"
                                                />
                                            </td>
                                            <td>{{ formatFileSize(doc.size) }}</td>
                                            <td>{{ formatDate(doc.created_at) }}</td>
                                            <td>
                                                <div class="btn-group btn-group-sm" role="group">
                                                    <button
                                                        class="btn btn-outline-info"
                                                        @click="downloadDocument(doc)"
                                                        title="Descargar"
                                                    >
                                                        <i class="fa-solid fa-download"></i>
                                                    </button>
                                                    <button
                                                        v-if="!doc.editing"
                                                        class="btn btn-outline-warning"
                                                        @click="editDescription(doc)"
                                                        title="Editar descripción"
                                                    >
                                                        <i class="fa-solid fa-edit"></i>
                                                    </button>
                                                    <button
                                                        v-else
                                                        class="btn btn-outline-success"
                                                        @click="saveDescription(doc)"
                                                        title="Guardar"
                                                    >
                                                        <i class="fa-solid fa-check"></i>
                                                    </button>
                                                    <button
                                                        v-if="doc.editing"
                                                        class="btn btn-outline-secondary"
                                                        @click="cancelEdit(doc)"
                                                        title="Cancelar"
                                                    >
                                                        <i class="fa-solid fa-times"></i>
                                                    </button>
                                                    <button
                                                        v-if="!doc.editing"
                                                        class="btn btn-outline-danger"
                                                        @click="confirmDelete(doc)"
                                                        title="Eliminar"
                                                    >
                                                        <i class="fa-solid fa-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal de subida de archivos -->
            <div class="modal fade" id="uploadModal" tabindex="-1" aria-labelledby="uploadModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="uploadModalLabel">
                                <i class="fa-solid fa-upload"></i> Subir Documento
                                <span v-if="selectedUser" class="text-muted">para {{ selectedUser.name }}</span>
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form @submit.prevent="uploadDocument">
                                <div class="mb-3">
                                    <label for="fileInput" class="form-label">Seleccionar archivo</label>
                                    <input
                                        type="file"
                                        class="form-control"
                                        id="fileInput"
                                        ref="fileInput"
                                        @change="onFileSelected"
                                        required
                                    />
                                    <div class="form-text">
                                        Tamaño máximo: 10MB. Formatos permitidos: PDF, DOC, DOCX, XLS, XLSX, TXT, JPG, PNG
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label for="description" class="form-label">Descripción</label>
                                    <textarea
                                        class="form-control"
                                        id="description"
                                        rows="3"
                                        v-model="uploadForm.description"
                                        placeholder="Describe brevemente el contenido del documento (opcional)"
                                    ></textarea>
                                </div>
                                <div v-if="selectedFile" class="alert alert-info">
                                    <div class="d-flex align-items-center">
                                        <i :class="getFileIcon(selectedFile.name)" class="me-2"></i>
                                        <div>
                                            <strong>{{ selectedFile.name }}</strong><br>
                                            <small>{{ formatFileSize(selectedFile.size) }}</small>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                Cancelar
                            </button>
                            <button
                                type="button"
                                class="btn btn-primary"
                                @click="uploadDocument"
                                :disabled="uploading || !selectedFile"
                            >
                                <span v-if="uploading">
                                    <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                                    Subiendo...
                                </span>
                                <span v-else>
                                    <i class="fa-solid fa-upload"></i> Subir
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal de confirmación de eliminación -->
            <div class="modal fade" id="deleteModal" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title text-danger" id="deleteModalLabel">
                                <i class="fa-solid fa-exclamation-triangle"></i> Confirmar eliminación
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <p>¿Estás seguro de que deseas eliminar el documento <strong>{{ documentToDelete?.filename }}</strong>?</p>
                            <p class="text-muted">Esta acción no se puede deshacer.</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                Cancelar
                            </button>
                            <button
                                type="button"
                                class="btn btn-danger"
                                @click="deleteDocument"
                                :disabled="deleting"
                            >
                                <span v-if="deleting">
                                    <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                                    Eliminando...
                                </span>
                                <span v-else>
                                    <i class="fa-solid fa-trash"></i> Eliminar
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    setup() {
        const { ref, computed, onMounted, nextTick } = Vue;

        /* Estado reactivo */
        const users = ref([]);
        const userDocuments = ref([]);
        const selectedUser = ref(null);
        const loadingUsers = ref(true);
        const loadingDocuments = ref(false);
        const uploading = ref(false);
        const deleting = ref(false);
        const selectedFile = ref(null);
        const documentToDelete = ref(null);
        const fileInput = ref(null);
        const searchQuery = ref('');

        /* Instancias de modals de Bootstrap */
        let uploadModalInstance = null;
        let deleteModalInstance = null;

        /* Formulario de subida */
        const uploadForm = ref({
            description: ''
        });

        /* Computed para filtrar usuarios */
        const filteredUsers = computed(() => {
            if (!searchQuery.value.trim()) {
                return users.value;
            }
            
            const query = searchQuery.value.toLowerCase().trim();
            return users.value.filter(user => 
                user.name.toLowerCase().includes(query) ||
                user.username.toLowerCase().includes(query) ||
                user.rut.toLowerCase().includes(query)
            );
        });

        /* Debounce para la búsqueda */
        let searchTimeout = null;
        const debouncedSearch = () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                // La búsqueda se realiza automáticamente a través del computed
            }, 300);
        };

        /* Cargar usuarios */
        const loadUsers = async () => {
            try {
                loadingUsers.value = true;
                const response = await apiFetch('/api/users');

                if (response.ok) {
                    const data = await response.json();
                    users.value = data || [];
                } else {
                    console.error('Error al cargar usuarios');
                    showAlert('Error al cargar los usuarios', 'danger');
                }
            } catch (error) {
                console.error('Error:', error);
                showAlert('Error de conexión', 'danger');
            } finally {
                loadingUsers.value = false;
            }
        };

        /* Seleccionar usuario */
        const selectUser = async (user) => {
            selectedUser.value = user;
            await loadUserDocuments(user.id);
        };

        /* Volver a la vista de usuarios */
        const goBackToUsers = () => {
            selectedUser.value = null;
            userDocuments.value = [];
        };

        /* Cargar documentos del usuario */
        const loadUserDocuments = async (userId) => {
            try {
                loadingDocuments.value = true;
                const response = await apiFetch(`/api/users/${userId}/documents`);

                if (response.ok) {
                    const data = await response.json();
                    userDocuments.value = data || [];
                } else {
                    console.error('Error al cargar documentos del usuario');
                    showAlert('Error al cargar los documentos del usuario', 'danger');
                }
            } catch (error) {
                console.error('Error:', error);
                showAlert('Error de conexión', 'danger');
            } finally {
                loadingDocuments.value = false;
            }
        };

        /* Inicializar modals */
        const initModals = () => {
            uploadModalInstance = new bootstrap.Modal(document.getElementById('uploadModal'));
            deleteModalInstance = new bootstrap.Modal(document.getElementById('deleteModal'));

            /* Agregar event listeners para limpiar formularios cuando se cierren los modals */
            document.getElementById('uploadModal').addEventListener('hidden.bs.modal', () => {
                resetUploadForm();
            });
        };

        /* Abrir modal de subida */
        const openUploadModal = () => {
            if (!selectedUser.value) return;
            uploadModalInstance.show();
        };

        /* Cerrar modal de subida */
        const closeUploadModal = () => {
            uploadModalInstance.hide();
        };

        /* Resetear formulario de subida */
        const resetUploadForm = () => {
            selectedFile.value = null;
            uploadForm.value.description = '';
            if (fileInput.value) {
                fileInput.value.value = '';
            }
        };

        /* Manejar selección de archivo */
        const onFileSelected = (event) => {
            const file = event.target.files[0];
            if (file) {
                /* Validar tamaño (10MB max) */
                if (file.size > 10 * 1024 * 1024) {
                    showAlert('El archivo es demasiado grande. Máximo 10MB permitido.', 'warning');
                    event.target.value = '';
                    return;
                }

                const allowedTypes = [
                    'application/pdf',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'application/vnd.ms-excel',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'text/plain',
                    'image/jpeg',
                    'image/png'
                ];

                if (!allowedTypes.includes(file.type)) {
                    showAlert('Tipo de archivo no permitido. Solo se permiten: PDF, DOC, DOCX, XLS, XLSX, TXT, JPG, PNG', 'warning');
                    event.target.value = '';
                    return;
                }

                selectedFile.value = file;
            }
        };

        /* Subir documento */
        const uploadDocument = async () => {
            if (!selectedFile.value || !selectedUser.value) {
                showAlert('Por favor selecciona un archivo', 'warning');
                return;
            }

            try {
                uploading.value = true;

                const formData = new FormData();
                formData.append('file', selectedFile.value);
                formData.append('description', uploadForm.value.description);
                formData.append('user_id', selectedUser.value.id);

                const storedUser = localStorage.getItem("user");
                const token = storedUser ? JSON.parse(storedUser).token : null;

                const response = await fetch('/api/admin/upload-document', {
                    method: 'POST',
                    headers: {
                        ...(token && { "X-Authorization": token })
                    },
                    body: formData
                });

                if (response.ok) {
                    showAlert('Documento subido exitosamente', 'success');
                    closeUploadModal();
                    await loadUserDocuments(selectedUser.value.id);
                } else {
                    const error = await response.json();
                    showAlert(error.message || 'Error al subir el documento', 'danger');
                }
            } catch (error) {
                console.error('Error:', error);
                showAlert('Error de conexión', 'danger');
            } finally {
                uploading.value = false;
            }
        };

        /* Editar descripción */
        const editDescription = (doc) => {
            doc.editing = true;
            doc.tempDescription = doc.description || '';
        };

        /* Guardar descripción */
        const saveDescription = async (doc) => {
            try {
                const response = await apiFetch(`/api/documents/${doc.id}/description`, 'PUT', {
                    description: doc.tempDescription
                });

                if (response.ok) {
                    doc.description = doc.tempDescription;
                    doc.editing = false;
                    showAlert('Descripción actualizada', 'success');
                } else {
                    showAlert('Error al actualizar la descripción', 'danger');
                }
            } catch (error) {
                console.error('Error:', error);
                showAlert('Error de conexión', 'danger');
            }
        };

        /* Cancelar edición */
        const cancelEdit = (doc) => {
            doc.editing = false;
            doc.tempDescription = '';
        };

        /* Confirmar eliminación */
        const confirmDelete = (doc) => {
            documentToDelete.value = doc;
            deleteModalInstance.show();
        };

        /* Eliminar documento */
        const deleteDocument = async () => {
            if (!documentToDelete.value) return;

            try {
                deleting.value = true;

                const response = await apiFetch(`/api/documents/${documentToDelete.value.id}`, 'DELETE');

                if (response.ok) {
                    showAlert('Documento eliminado exitosamente', 'success');
                    deleteModalInstance.hide();
                    documentToDelete.value = null;
                    await loadUserDocuments(selectedUser.value.id);
                } else {
                    showAlert('Error al eliminar el documento', 'danger');
                }
            } catch (error) {
                console.error('Error:', error);
                showAlert('Error de conexión', 'danger');
            } finally {
                deleting.value = false;
            }
        };

        /* Descargar documento */
        const downloadDocument = async (doc) => {
            try {
                const storedUser = localStorage.getItem("user");
                const token = storedUser ? JSON.parse(storedUser).token : null;

                const response = await fetch(`/api/documents/${doc.id}/download`, {
                    headers: {
                        ...(token && { "X-Authorization": token })
                    }
                });

                if (response.ok) {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = doc.filename;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                } else {
                    showAlert('Error al descargar el documento', 'danger');
                }
            } catch (error) {
                console.error('Error:', error);
                showAlert('Error de conexión', 'danger');
            }
        };

        /* Utilidades */
        const formatFileSize = (bytes) => {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        };

        const formatDate = (dateString) => {
            return new Date(dateString).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        };

        const getFileIcon = (filename) => {
            const extension = filename.split('.').pop().toLowerCase();
            const iconMap = {
                'pdf': 'fa-solid fa-file-pdf text-danger',
                'doc': 'fa-solid fa-file-word text-primary',
                'docx': 'fa-solid fa-file-word text-primary',
                'xls': 'fa-solid fa-file-excel text-success',
                'xlsx': 'fa-solid fa-file-excel text-success',
                'txt': 'fa-solid fa-file-text text-secondary',
                'jpg': 'fa-solid fa-file-image text-info',
                'jpeg': 'fa-solid fa-file-image text-info',
                'png': 'fa-solid fa-file-image text-info'
            };
            return iconMap[extension] || 'fa-solid fa-file text-secondary';
        };

        const showAlert = (message, type = 'info') => {
            /* Implementación simple de alertas */
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
            }, 5000);
        };

        /* Cargar usuarios e inicializar modals al montar el componente */
        onMounted(async () => {
            await loadUsers();
            await nextTick(); /* Esperar a que el DOM se actualice */
            initModals();
        });

        return {
            users,
            userDocuments,
            selectedUser,
            loadingUsers,
            loadingDocuments,
            uploading,
            deleting,
            selectedFile,
            documentToDelete,
            uploadForm,
            fileInput,
            searchQuery,
            filteredUsers,
            debouncedSearch,
            selectUser,
            goBackToUsers,
            openUploadModal,
            onFileSelected,
            uploadDocument,
            closeUploadModal,
            editDescription,
            saveDescription,
            cancelEdit,
            confirmDelete,
            deleteDocument,
            downloadDocument,
            formatFileSize,
            formatDate,
            getFileIcon
        };
    }
};