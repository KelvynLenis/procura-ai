import axios from "axios";

// Validação das variáveis de ambiente essenciais
const baseURL = process.env.NEXT_PUBLIC_API_URL;
const appwriteProjectId = process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID;
const appwriteKey =process.env.NEXT_PUBLIC_API_KEY

if (!baseURL || !appwriteProjectId) {
    throw new Error("Variáveis de ambiente obrigatórias estão ausentes: NEXT_PUBLIC_API_URL ou NEXT_PUBLIC_APP_WRITE_PROJECT_ID.");
}

// Criação da instância do Axios
const api = axios.create({
    baseURL,
    headers: {
        "X-Appwrite-Project": appwriteProjectId,
        "Content-Type": "application/json",
        "X-Appwrite-Key":appwriteKey
    },
    timeout: 10000, // Timeout de 10 segundos para evitar travamentos
});

// Interceptor para adicionar headers dinâmicos (se necessário)
api.interceptors.request.use(
    (config) => {
        // Exemplo: adicionar token de autenticação, se necessário
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.log("Erro na configuração da requisição:", error);
        return Promise.reject(error);
    }
);

// Interceptor para centralizar o tratamento de erros
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            console.log(`Erro ${error.response.status}:`, error.response.data);
        } else if (error.request) {
            console.log("Nenhuma resposta recebida:", error.request);
        } else {
            console.log("Erro ao configurar requisição:", error.message);
        }
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Redireciona o usuário
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default api;
