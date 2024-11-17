import PropTypes from 'prop-types';

const InputError = ({ children }) => {
  return (
    <div className="invalid-feedback" style={{ display: 'block' }}>
      {children}
    </div>
  );
};

InputError.propTypes = {
  children: PropTypes.node.isRequired,
};

export default InputError;
