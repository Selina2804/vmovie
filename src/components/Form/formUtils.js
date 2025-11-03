
export const handleChange = (e, form, setForm) => {
  setForm({ ...form, [e.target.name]: e.target.value });
};

export const resetForm = (defaultForm, setForm, setIsEditing, setShowModal) => {
  setForm(defaultForm);
  if (setIsEditing) setIsEditing(false);
  if (setShowModal) setShowModal(false);
};

export const closeModal = (defaultForm, setForm, setIsEditing, setShowModal) => {
  resetForm(defaultForm, setForm, setIsEditing, setShowModal);
};
