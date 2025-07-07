import * as yup from "yup";

export const schema = yup.object().shape({
  fullName: yup.string().required("Full Name is required"),
  title: yup.string().required("Title is required"),
  description: yup.string().required("Description is required"),
});
