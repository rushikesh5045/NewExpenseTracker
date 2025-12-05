import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Input from "../common/Input";
import Button from "../common/Button";

const RegisterForm = ({ onRegister, loading }) => {
  const { t } = useTranslation();

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required(t("Name is required")),
      email: Yup.string()
        .email(t("Invalid email address"))
        .required(t("Email is required")),
      password: Yup.string()
        .min(8, t("Password must be at least 8 characters"))
        .required(t("Password is required")),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password"), null], t("Passwords must match"))
        .required(t("Confirm password is required")),
    }),
    onSubmit: (values) => {
      onRegister(values);
    },
  });

  return (
    <form
      onSubmit={formik.handleSubmit}
      className="w-full max-w-md mx-auto p-6"
    >
      <h2 className="text-2xl font-bold mb-6 text-center">
        {t("Create Account")}
      </h2>

      <Input
        label={t("Name")}
        type="text"
        name="name"
        value={formik.values.name}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.name && formik.errors.name}
        placeholder={t("Enter your name")}
      />

      <Input
        label={t("Email")}
        type="email"
        name="email"
        value={formik.values.email}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.email && formik.errors.email}
        placeholder={t("Enter your email")}
      />

      <Input
        label={t("Password")}
        type="password"
        name="password"
        value={formik.values.password}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.password && formik.errors.password}
        placeholder={t("Create a password")}
      />

      <Input
        label={t("Confirm Password")}
        type="password"
        name="confirmPassword"
        value={formik.values.confirmPassword}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.confirmPassword && formik.errors.confirmPassword}
        placeholder={t("Confirm your password")}
      />

      <Button type="submit" className="w-full mt-4" loading={loading}>
        {t("Register")}
      </Button>

      <p className="mt-4 text-center text-sm">
        {t("Already have an account?")}{" "}
        <Link to="/login" className="text-blue-500 hover:text-blue-700">
          {t("Login here")}
        </Link>
      </p>
    </form>
  );
};

export default RegisterForm;
