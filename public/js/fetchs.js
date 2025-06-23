async function apiFetch(url, method = "GET", data = null) {
    const storedUser = localStorage.getItem("user");
    const token = storedUser ? JSON.parse(storedUser).token : null;

    return fetch(url, {
        method,
        headers: {
            "Content-Type": "application/json",
            ...(token && { "X-Authorization": token })
        },
        ...(data && { body: JSON.stringify(data) })
    });
}

