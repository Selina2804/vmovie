// src/services/apiService.js
import axios from "axios";

const BASE_URL = "https://68faff8894ec96066024411b.mockapi.io";

export const fetchAll = async (resource) => {
  try {
    const res = await axios.get(`${BASE_URL}/${resource}`);
    return res.data;
  } catch (err) {
    console.error(`Lỗi fetch ${resource}:`, err);
    return [];
  }
};

export const createItem = async (resource, item) => {
  try {
    const res = await axios.post(`${BASE_URL}/${resource}`, item);
    return res.data;
  } catch (err) {
    console.error(`Lỗi tạo ${resource}:`, err);
  }
};

export const updateItem = async (resource, id, item) => {
  try {
    const res = await axios.put(`${BASE_URL}/${resource}/${id}`, item);
    return res.data;
  } catch (err) {
    console.error(`Lỗi cập nhật ${resource}:`, err);
  }
};

export const deleteItem = async (resource, id) => {
  try {
    await axios.delete(`${BASE_URL}/${resource}/${id}`);
  } catch (err) {
    console.error(`Lỗi xóa ${resource}:`, err);
  }
};
