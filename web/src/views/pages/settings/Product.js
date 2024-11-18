import SimpleHeader from "../../../components/Headers/SimpleHeader";
import { Button, Card, CardHeader, Col, Container, FormGroup, Input, InputGroup, Row } from "reactstrap";
import React, { useEffect, useState } from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import classnames from "classnames";
import InputError from "../../../components/Errors/InputError";
import { getOrg, patchCurrentOrg, setCurrentOrg } from "../../../services/org/orgs.service";
import { toast } from "react-toastify";
import LoadingSpinnerBox from "../components/LoadingSpinnerBox";

function Product() {
  const [productName, setProductName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedProductName, setFocusedProductName] = useState(false);
  const [isLoadingProductName, setIsLoadingProductName] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setIsLoadingProductName(true);
      try {
        const org = await getOrg();
        setProductName(org.name);
      } catch (e) {
        toast.error("Failed to fetch product name");
      } finally {
        setIsLoadingProductName(false);
      }
    }

    fetchData();
  }, []);

  const validationSchema = Yup.object().shape({
    productName: Yup.string().trim()
      .required("Product name is required")
      .min(2, "Product name must be at least 3 characters")
  });

  async function handleSubmit(values) {
    setProductName(values.productName);
    await patchCurrentOrg({ name: values.productName });
    await setCurrentOrg();
    toast.success("Product name saved");

    // TODO: This is a hack to refresh the local storage data. We should find a better way to do this.
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }

  return (
    <>
      <SimpleHeader />
      <Container className="mt--6 pb-4" fluid>
        <Card className="shadow">
          <CardHeader>
            <h3 className="mb-0">Product</h3>
          </CardHeader>
          {isLoadingProductName && <LoadingSpinnerBox />}
          {!isLoadingProductName && <Row className="p-4">
            <Col>
              <Formik
                initialValues={{ productName: productName }}
                validationSchema={validationSchema}
                onSubmit={async (values, { setErrors }) => {
                  try {
                    setIsSubmitting(true);
                    await handleSubmit(values);
                  } catch (e) {
                    setErrors({ productName: e.message });
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
              >
                {({ values, handleChange, errors, touched }) => (
                  <Form
                    className="needs-validation"
                    noValidate>
                    <h4>Product Name</h4>
                    <FormGroup
                      className={classnames({
                        focused: focusedProductName
                      })}
                    >
                      <InputGroup className="input-group input-group-merge">
                        <Field
                          as={Input}
                          name="productName"
                          placeholder="The name of your product"
                          type="text"
                          onFocus={() => setFocusedProductName(true)}
                          onBlur={() => setFocusedProductName(false)}
                          value={values.productName}
                          invalid={!!(errors.productName && touched.productName)}
                          className="px-3"
                          autoComplete="off"
                        />
                        <ErrorMessage name="productName" component={InputError} />
                      </InputGroup>
                    </FormGroup>
                    <div>
                      <Button color="primary" type="submit"
                              disabled={isSubmitting}>
                        Save Settings
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </Col>
          </Row>}
        </Card>
      </Container>
    </>
  );
}

export default Product;
