const MyDocuments = {
    template: /*HTML*/ `
        <div class="page-content">
            <div class="page-header">
                <div>
                    <h2>Mis Documentos</h2>
                    <p class="text-muted">Gestiona tus documentos</p>
                </div>
                <button class="btn btn-primary" @click="openUploadModal">
                    <i class="fa-solid fa-upload"></i> Subir archivo
                </button>
            </div>

            <div class="page-body">
                <!-- Tabla de documentos -->
                <div class="card">
                    <div class="card-body">
                        <div v-if="loading" class="text-center py-4">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Cargando...</span>
                            </div>
                        </div>
                        <div v-else-if="documents.length === 0" class="text-center py-4">
                            <i class="fa-solid fa-folder-open fa-3x text-muted mb-3"></i>
                            <h5 class="text-muted">No tienes documentos</h5>
                            <p class="text-muted">Sube tu primer documento haciendo clic en el botón "Subir archivo"</p>
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
                                    <tr v-for="doc in documents" :key="doc.id">
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

            <!-- Modal de subida de archivos -->
            <div class="modal fade" id="uploadModal" tabindex="-1" aria-labelledby="uploadModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="uploadModalLabel">
                                <i class="fa-solid fa-upload"></i> Subir Documento
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
        const { ref, onMounted, nextTick } = Vue;

        /* Estado reactivo */
        const documents = ref([]);
        const loading = ref(true);
        const uploading = ref(false);
        const deleting = ref(false);
        const selectedFile = ref(null);
        const documentToDelete = ref(null);
        const fileInput = ref(null);

        /* Instancias de modals de Bootstrap */
        let uploadModalInstance = null;
        let deleteModalInstance = null;

        /* Formulario de subida */
        const uploadForm = ref({
            description: ''
        });

        /* Cargar documentos */
        const loadDocuments = async () => {
            console.log("Test");
            try {
                loading.value = true;
                const response = await apiFetch('/api/my-documents');

                if (response.ok) {
                    const data = await response.json();
                    console.log(data);
                    documents.value = data || [];
                } else {
                    console.error('Error al cargar documentos');
                    showAlert('Error al cargar los documentos', 'danger');
                }
            } catch (error) {
                console.error('Error:', error);
                showAlert('Error de conexión', 'danger');
            } finally {
                loading.value = false;
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
            if (!selectedFile.value) {
                showAlert('Por favor selecciona un archivo', 'warning');
                return;
            }

            try {
                uploading.value = true;

                const formData = new FormData();
                formData.append('file', selectedFile.value);
                formData.append('description', uploadForm.value.description);

                console.log(formData);

                const storedUser = localStorage.getItem("user");
                const token = storedUser ? JSON.parse(storedUser).token : null;

                const response = await fetch('/api/upload-document', {
                    method: 'POST',
                    headers: {
                        ...(token && { "X-Authorization": token })
                    },
                    body: formData
                });

                if (response.ok) {
                    showAlert('Documento subido exitosamente', 'success');
                    closeUploadModal();
                    await loadDocuments();
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
                    await loadDocuments();
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

        /* Cargar documentos e inicializar modals al montar el componente */
        onMounted(async () => {
            await loadDocuments();
            await nextTick(); /* Esperar a que el DOM se actualice */
            initModals();
        });

        return {
            documents,
            loading,
            uploading,
            deleting,
            selectedFile,
            documentToDelete,
            uploadForm,
            fileInput,
            loadDocuments,
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