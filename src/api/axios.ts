import axios from "axios";

export const api = axios.create({
  baseURL: "https://en.wikipedia.org/w/api.php",
  timeout: 5000,
});
