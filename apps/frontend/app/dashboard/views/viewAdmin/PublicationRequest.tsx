export default function PublicationRequest({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 bg-black/20" onClick={onClick} />
      <article className="slide-in-right bg-blue-600/20 backdrop-blur-xs fixed z-10 top-0 right-0 w-full md:w-sm h-full">
        <header className="flex items-center justify-between p-6">
          <h2 className="text-xl font-semibold">Solicitudes de Publicación</h2>

          <button
            onClick={onClick}
            className="bg-orange-600 hover:bg-orange-700 text-white px-2 rounded-md"
          >
            X
          </button>
        </header>
      </article>
    </>
  );
}
