import Image from "next/image";

export default function Loading() {
  return (
    // a11y: 4.1.3 Status Messages – role=status announces page loading to AT
    <div role="status" aria-label="Chargement de la page" className="flex-center size-full h-screen gap-3 text-white">
      {/* a11y: 1.1.1 Non-text Content – decorative spinner; label is on the container */}
      <Image
        src="/assets/icons/loader.svg"
        alt=""
        aria-hidden="true"
        width={40}
        height={3240}
        className="animate-spin"
      />
      Loading...
    </div>
  );
}
