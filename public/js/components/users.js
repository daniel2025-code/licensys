const Users = {
    template: /*HTML*/ `
        <div class="page-content">
            <div class="page-header">
                <div>
                    <h2>Gestión de Usuarios</h2>
                    <p class="text-muted">Administrar usuarios del sistema</p>
                </div>
                <button @click="openNewUserModal" class="btn btn-primary">
                    <i class="fa-solid fa-user-plus"></i> Nuevo usuario
                </button>
            </div>
            <div class="page-body">
                <div id="tableUsers"></div>
            </div>

            <!-- Modal para crear/editar usuario -->
            <div class="modal fade" id="userModal" tabindex="-1" aria-labelledby="userModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="userModalLabel">{{ isEditing ? 'Editar Usuario' : 'Nuevo Usuario' }}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form @submit.prevent="saveUser">
                                <div class="mb-3">
                                    <label for="userName" class="form-label">Nombre</label>
                                    <input v-model="currentUser.name" type="text" class="form-control" id="userName" autocomplete="off" required>
                                </div>
                                <div class="mb-3">
                                    <label for="userUsername" class="form-label">Usuario</label>
                                    <input v-model="currentUser.username" type="text" class="form-control" id="userUsername" required>
                                </div>
                                <div class="mb-3">
                                    <label for="userRut" class="form-label">Rut</label>
                                    <input v-model="currentUser.rut" type="text" class="form-control" id="userRut" required>
                                </div>
                                <div class="mb-3">
                                    <label for="userRole" class="form-label">Rol</label>
                                    <select v-model="currentUser.role" class="form-select" id="userRole" required>
                                        <option value="">Seleccionar rol</option>
                                        <option value="admin">Administrador</option>
                                        <option value="user">Usuario</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label for="userPassword" class="form-label">{{ isEditing ? 'Nueva contraseña' : 'Contraseña' }}</label>
                                    <input v-model="currentUser.password" type="password" class="form-control" id="userPassword" autocomplete="off" required>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" @click="saveUser" class="btn btn-primary">
                                {{ isEditing ? 'Actualizar' : 'Crear' }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal para confirmar eliminación -->
            <div class="modal fade" id="deleteModal" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="deleteModalLabel">Confirmar Eliminación</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <p>¿Estás seguro de que deseas eliminar al usuario <strong>{{ userToDelete?.name }}</strong>?</p>
                            <p class="text-muted">Esta acción no se puede deshacer.</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" @click="confirmDelete" class="btn btn-danger">Eliminar</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    setup() {
        const table = Vue.ref(null);
        const isEditing = Vue.ref(false);
        const currentUser = Vue.ref({
            id: null,
            name: '',
            username: '',
            rut: '',
            role: '',
            password: ''
        });
        const userToDelete = Vue.ref(null);

        /* Inicializar tabla cuando el componente se monte */
        Vue.onMounted(() => {
            initTable();
            loadUsers();
        });

        /* Destruir tabla cuando el componente se desmonte */
        Vue.onUnmounted(() => {
            if (table.value) {
                table.value.destroy();
            }
        });

        function initTable() {
            table.value = new Tabulator("#tableUsers", {
                layout: "fitColumns",
                responsiveLayout: "hide",
                pagination: "local",
                paginationSize: 10,
                paginationSizeSelector: [5, 10, 20, 50],
                movableColumns: true,
                resizableRows: true,
                columns: [
                    {
                        title: "ID",
                        field: "id",
                        width: 70,
                        sorter: "number"
                    },
                    {
                        title: "Nombre",
                        field: "name",
                        sorter: "string",
                        headerFilter: "input"
                    },
                    {
                        title: "Usuario",
                        field: "username",
                        sorter: "string",
                        headerFilter: "input"
                    },
                    {
                        title: "Rut",
                        field: "rut",
                        sorter: "string",
                        headerFilter: "input"
                    },
                    {
                        title: "Rol",
                        field: "role",
                        sorter: "string",
                        headerFilter: "select",
                        headerFilterParams: {
                            "": "Todos",
                            "admin": "Administrador",
                            "user": "Usuario"
                        },
                        formatter: function(cell, formatterParams) {
                            const value = cell.getValue();
                            if (value === 'admin') {
                                return '<span class="badge bg-danger">Administrador</span>';
                            } else if (value === 'user') {
                                return '<span class="badge bg-primary">Usuario</span>';
                            }
                            return value;
                        }
                    },
                    {
                        title: "Acciones",
                        field: "actions",
                        width: 120,
                        formatter: function(cell, formatterParams) {
                            return /*HTML*/ `
                                <button class="btn btn-sm btn-outline-primary me-1 edit-btn" title="Editar">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger delete-btn" title="Eliminar">
                                    <i class="fas fa-trash"></i>
                                </button>
                            `;
                        },
                        cellClick: function(e, cell) {
                            e.preventDefault();
                            const userData = cell.getRow().getData();

                            if (e.target.closest('.edit-btn')) {
                                editUser(userData);
                            } else if (e.target.closest('.delete-btn')) {
                                deleteUser(userData);
                            }
                        }
                    }
                ]
            });
        }

        async function loadUsers() {
            try {
                const response = await apiFetch('/api/users');
                if (response.ok) {
                    const users = await response.json();
                    table.value.setData(users);
                } else {
                    console.error('Error al cargar usuarios');
                }
            } catch (error) {
                console.error('Error al cargar usuarios:', error);
            }
        }

        function openNewUserModal() {
            isEditing.value = false;
            currentUser.value = {
                id: null,
                name: '',
                username: '',
                rut: '',
                role: '',
                password: ''
            };
            const modal = new bootstrap.Modal(document.getElementById('userModal'));
            modal.show();
        }

        function editUser(userData) {
            isEditing.value = true;
            currentUser.value = {
                id: userData.id,
                name: userData.name,
                username: userData.username,
                rut: userData.rut,
                role: userData.role,
                password: ''
            };
            const modal = new bootstrap.Modal(document.getElementById('userModal'));
            modal.show();
        }

        function deleteUser(userData) {
            userToDelete.value = userData;
            const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
            modal.show();
        }

        async function saveUser() {
            try {
                const url = isEditing.value ? `/api/users/${currentUser.value.id}` : '/api/users';
                const method = isEditing.value ? 'PUT' : 'POST';

                if (method === 'POST') delete currentUser.value.id;

                const response = await apiFetch(url, method, currentUser.value);

                if (response.ok) {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('userModal'));
                    modal.hide();
                    await loadUsers();
                } else {
                    console.error('Error al guardar usuario');
                }
            } catch (error) {
                console.error('Error al guardar usuario:', error);
            }
        }

        async function confirmDelete() {
            try {
                const response = await apiFetch(`/api/users/${userToDelete.value.id}`, 'DELETE');

                if (response.ok) {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
                    modal.hide();
                    await loadUsers();
                } else {
                    console.error('Error al eliminar usuario');
                }
            } catch (error) {
                console.error('Error al eliminar usuario:', error);
            }
        }

        return {
            isEditing,
            currentUser,
            userToDelete,
            openNewUserModal,
            editUser,
            deleteUser,
            saveUser,
            confirmDelete
        };
    }
};