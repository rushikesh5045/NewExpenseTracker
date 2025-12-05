import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Input from "../common/Input";
import Button from "../common/Button";

const LoginForm = ({ onLogin, loading }) => {
  const { t } = useTranslation();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email(t("Invalid email address"))
        .required(t("Email is required")),
      password: Yup.string().required(t("Password is required")),
    }),
    onSubmit: (values) => {
      onLogin(values);
    },
  });

  return (
    <form
      onSubmit={formik.handleSubmit}
      className="w-full max-w-md mx-auto p-6"
    >
      <h2 className="text-2xl font-bold mb-6 text-center">{t("Login")}</h2>

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
        placeholder={t("Enter your password")}
      />

      <Button type="submit" className="w-full mt-4" loading={loading}>
        {t("Login")}
      </Button>

      <p className="mt-4 text-center text-sm">
        {t("Don't have an account?")}{" "}
        <Link to="/register" className="text-blue-500 hover:text-blue-700">
          {t("Register here")}
        </Link>
      </p>
    </form>
  );
};

export default LoginForm;
