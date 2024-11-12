import React from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { Button, Input, InputGroup } from "reactstrap";
import InputError from "../../../../components/Errors/InputError";
import { patchCurrentUser } from "../../../../services/users/users.service";
import { toast } from "react-toastify";

export default function ChangeName() {
  const currentUserName = localStorage.getItem("currentUserName");

  const validationSchema = Yup.object({
    name: Yup.string()
      .min(2, "Name must be at least 2 characters")
      .required("Name is required")
  });

  const initialValues = {
    name: currentUserName
  };

  return (<>
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          setSubmitting(true);
          await patchCurrentUser(values);
          toast.success("Name changed successfully");
          // TODO: This is a hack to refresh the local storage data. We should find a better way to do this.
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } catch (e) {
          toast.error(e.message);
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ values, isSubmitting, errors, touched }) => (
        <Form>
          <h3>Name</h3>
          <InputGroup className="mb-3">
            <Field
              as={Input}
              id="name"
              name="name"
              placeholder="Your full name"
              type="text"
              value={values.name}
              invalid={!!(errors.name && touched.name)}
              autoComplete="off"
            />
            <ErrorMessage name={"name"} component={InputError} />
          </InputGroup>
          <Button color="primary" type="submit" disabled={isSubmitting}>Save</Button>
        </Form>
      )}
    </Formik>
  </>);
}
