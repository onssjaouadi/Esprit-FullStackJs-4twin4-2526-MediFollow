import Image from "next/image";

import { Button } from "./ui/button";

interface ButtonProps {
  isLoading: boolean;
  className?: string;
  children: React.ReactNode;
}

const SubmitButton = ({ isLoading, className, children }: ButtonProps) => {
  return (
    <Button
      type="submit"
      disabled={isLoading}
      // a11y: 4.1.2 Name, Role, Value – expose disabled state explicitly for AT
      aria-disabled={isLoading}
      className={className ?? "shad-primary-btn w-full"}
    >
      {isLoading ? (
        // a11y: 4.1.3 Status Messages – role=status announces loading state to AT
        <div role="status" aria-label="Chargement en cours" className="flex items-center gap-4">
          {/* a11y: 1.1.1 Non-text Content – loader image is decorative */}
          <Image
            src="/assets/icons/loader.svg"
            alt=""
            aria-hidden="true"
            width={24}
            height={24}
            className="animate-spin"
          />
          Loading...
        </div>
      ) : (
        children
      )}
    </Button>
  );
};

export default SubmitButton;
