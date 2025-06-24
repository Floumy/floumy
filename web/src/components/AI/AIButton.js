import { Button } from 'reactstrap';
import { useState } from 'react';

const AIButton = ({ onClick, text = 'Add with AI', disabled = false }) => {
  const [isLoading, setIsLoading] = useState(false);
  return (
    <Button
      color="link"
      size="sm"
      className="ml-2 p-0 shadow-none"
      style={{ color: '#9b59b6' }}
      disabled={disabled}
      onClick={async () => {
        setIsLoading(true);
        await onClick();
        setIsLoading(false);
      }}
    >
      {isLoading ? (
        <i className="fas fa-spinner fa-spin fa-1x"></i>
      ) : (
        <>
          <i className="fas fa-wand-magic-sparkles"></i> {text}
        </>
      )}
    </Button>
  );
};

export default AIButton;
